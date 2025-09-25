# --- �K�v�Ȍ^��ǂݍ��� ---
Add-Type -AssemblyName Microsoft.VisualBasic
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public static class User32 {
  [DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr hWnd, int nCmdShow);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
}
"@

# --- COM Message Filter�iRPC_E_CALL_REJECTED �΍�j ---
Add-Type -Language CSharp -TypeDefinition @"
using System;
using System.Runtime.InteropServices;

[ComImport, Guid("00000016-0000-0000-C000-000000000046"),
 InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IOleMessageFilter {
  [PreserveSig] int HandleInComingCall(int dwCallType, IntPtr hTaskCaller, int dwTickCount, IntPtr lpInterfaceInfo);
  [PreserveSig] int RetryRejectedCall(IntPtr hTaskCallee, int dwTickCount, int dwRejectType);
  [PreserveSig] int MessagePending(IntPtr hTaskCallee, int dwTickCount, int dwPendingType);
}

public class MessageFilter : IOleMessageFilter {
  [DllImport("Ole32.dll")]
  private static extern int CoRegisterMessageFilter(IOleMessageFilter newFilter, out IOleMessageFilter oldFilter);

  public static void Register() { IOleMessageFilter old; CoRegisterMessageFilter(new MessageFilter(), out old); }
  public static void Revoke()   { IOleMessageFilter old; CoRegisterMessageFilter(null, out old); }

  public int HandleInComingCall(int dwCallType, IntPtr hTaskCaller, int dwTickCount, IntPtr lpInterfaceInfo) { return 0; }
  public int RetryRejectedCall(IntPtr hTaskCallee, int dwTickCount, int dwRejectType) {
    if (dwRejectType == 2) return 100; // SERVERCALL_RETRYLATER -> 100ms ��Ď��s
    return -1;
  }
  public int MessagePending(IntPtr hTaskCallee, int dwTickCount, int dwPendingType) { return 1; }
}
"@

function Invoke-Com {
  param(
    [Parameter(Mandatory=$true)][scriptblock]$Action,
    [int]$MaxTry = 50,
    [int]$DelayMs = 150
  )
  for ($i=0; $i -lt $MaxTry; $i++) {
    try { return & $Action }
    catch [System.Runtime.InteropServices.COMException] {
      if ($_.Exception.HResult -eq -2147418111) { Start-Sleep -Milliseconds $DelayMs; continue } # 0x80010001
      throw
    }
  }
  throw "COM �Ăяo���̍Ď��s������ɒB���܂����iRPC_E_CALL_REJECTED ���p���j"
}

# Excel �A�v���P�[�V����������\�ɂȂ�܂őҋ@
function Wait-ExcelReady {
  param([object]$App, [int]$TimeoutSec = 20)
  $sw = [Diagnostics.Stopwatch]::StartNew()
  while ($sw.Elapsed.TotalSeconds -lt $TimeoutSec) {
    try {
      $ready = Invoke-Com { $App.Ready }
      $interactive = Invoke-Com { $App.Interactive }
      if ($ready -and $interactive) { return }
    } catch {}
    Start-Sleep -Milliseconds 200
  }
}

# Excel �A�v���P�[�V�������擾�i���N���^�����s��v�Ȃ��O�j
function Get-ExcelSafe {
  param([int]$MaxTry = 30, [int]$DelayMs = 200)
  for ($i=0; $i -lt $MaxTry; $i++) {
    try {
      $app = [Runtime.InteropServices.Marshal]::GetActiveObject("Excel.Application")
      if ($app) { return $app }
    } catch { Start-Sleep -Milliseconds $DelayMs }
  }
  throw "Excel ��������܂���i���N���^�����s��v�j"
}

# �w�胂�W���[���� Public Sub �ꗗ���擾
function Get-ModulePublicSubs {
  param(
    [object]$VBComponent,   # VBIDE.VBComponent
    [string]$WorkbookName
  )
  $res = @()
  try {
    $cm = Invoke-Com { $VBComponent.CodeModule }
    $lines = Invoke-Com { $cm.Lines(1, $cm.CountOfLines) }
    # Public Sub �̐��K�\���i��������/�Ȃ����Ή��A������R�����g�͊ȈՏ��O�j
    $regex = [regex]'(?im)^\s*Public\s+Sub\s+([A-Za-z_][A-Za-z0-9_]*)\s*(\(|$)'
    foreach ($m in $regex.Matches($lines)) {
      $proc = $m.Groups[1].Value
      $res += [pscustomobject]@{
        WorkbookName = $WorkbookName
        Module       = $VBComponent.Name
        Proc         = $proc
        Qualified    = "'$WorkbookName'!" + $VBComponent.Name + "." + $proc
      }
    }
  } catch {}
  return $res
}

# ������𐳋K������ SHA256 �n�b�V�����擾
function Get-NormalizedTextHash {
  param([string]$Text)
  $norm = ($Text -replace "`r`n","`n") -replace "`r","`n"
  $bytes = [Text.Encoding]::UTF8.GetBytes($norm)
  $sha = [Security.Cryptography.SHA256]::Create()
  $hash = $sha.ComputeHash($bytes)
  -join ($hash | ForEach-Object { $_.ToString("x2") })
}

# Excel ��O�ʉ�
function Show-ExcelFront {
  param([Parameter(Mandatory=$true)]$Excel)
  if (-not $Excel) { return }      
  try {
    $null = $Excel.Visible = $true
    $hwnd = $Excel.Hwnd
    if($hwnd){[User32]::ShowWindowAsync([intptr]$hwnd, 9) | Out-Null }  # SW_RESTORE
    try { $Excel.ActiveWindow.WindowState = -4143 } catch {} # xlNormal
    try { $Excel.Windows.Item(1).Activate() } catch {}
    try { [Microsoft.VisualBasic.Interaction]::AppActivate($Excel.Caption) | Out-Null } catch {}
  } catch {}
}

# Utility: ���K���i�g���q/��/�p�X���z���A�召�����͖����j
function Set-WorkbookName([string]$name) {
  if ([string]::IsNullOrWhiteSpace($name)) { return $null }
  $trim = $name.Trim(" `t`r`n`0")
  try { $file = [System.IO.Path]::GetFileName($trim) } catch { $file = $trim }
  return $file
}

# BasPath �̓��e�ƈ�v���郂�W���[�������u�b�N�����
function Find-DetectWorkbookByBas {
  param(
    [object]$Excel,
    [string]$ModuleName,
    [string]$BasPath
  )
  if (-not (Test-Path -LiteralPath $BasPath)) { return $null }
  $basText = Get-Content -LiteralPath $BasPath -Raw -Encoding UTF8
  $basHash = Get-NormalizedTextHash -Text $basText

  $candidates = @()
  $wbs = Invoke-Com { @($Excel.Workbooks) }
  # ���[�v�̊O�ň�x����
  $wantWb = Set-WorkbookName $WorkbookName

  foreach ($wb in $wbs) {
    # ���[�v���擪
    $currName = Set-WorkbookName (Invoke-Com { $wb.Name })
    if ($wantWb -and ($null -ne $currName) -and ($currName -ine $wantWb)) { continue }

    if ($WorkbookName -and ($wb.Name -ne $WorkbookName)) { continue }  # �� �ǉ�
    try {
      $vbp = Invoke-Com { $wb.VBProject }
      $comps = Invoke-Com { @($vbp.VBComponents) }
      foreach ($c in $comps) {
        if ((Invoke-Com { $c.Name }) -ne $ModuleName) { continue }
        $cm = Invoke-Com { $c.CodeModule }
        $code = Invoke-Com { $cm.Lines(1, $cm.CountOfLines) }
        $hash = Get-NormalizedTextHash -Text $code
        if ($hash -eq $basHash) { $candidates += $wb }
      }
    } catch {}
  }

  if ($candidates.Count -eq 1) { return $candidates[0] }
  return $null
}