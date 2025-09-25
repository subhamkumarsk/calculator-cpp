<#
    File: FindAndRun-ExcelMacroByModule.ps1
    Description: �N������ Excel ���� �w�胂�W���[���� Public Sub �ꗗ���擾���A�C�ӂ� �}�N�������s�ł��� PowerShell �X�N���v�g
    Author: Eitaro SETA
    License: MIT License
    Copyright (c) 2025 Eitaro SETA

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
#>

<# 
.SYNOPSIS
  �N������ Excel ����w�胂�W���[���� Public Sub ��񋓁^���s����

.PARAMETER ModuleName
  �Ώۂ� VBA ���W���[�����iVB_Name�j�B��: Module1

.PARAMETER BasPath
  �Ή����� .bas �t�@�C���̐�΃p�X�i�ȗ��j�B
  ���e�n�b�V���ň�v����u�b�N��D��I�ɓ��肷�邽�߂Ɏg�p�B

.PARAMETER ListOutput
  "JSON" ���w�肷��ƈꗗ�� JSON �ŏo�́i����: JSON�j�B���`���͖������B

.PARAMETER ProcName
  ���s������ Public Sub ���B�w�肳�ꂽ�ꍇ�A���̃}�N�������s����B

.EXAMPLE
  # �ꗗ�o�́iJSON�j
  powershell -ExecutionPolicy Bypass -File .\FindAndRun-ExcelMacroByModule.ps1 `
    -ModuleName Module1 -ListOutput JSON

.EXAMPLE
  # Book1.xlsm �� Module1.DoWork �����s
  powershell -ExecutionPolicy Bypass -File .\FindAndRun-ExcelMacroByModule.ps1 `
    -Qualified  "'Book1.xlsm'!Module1.DoWork"
    
.EXAMPLE
  # Module1.DoWork �����s
  powershell -ExecutionPolicy Bypass -File .\FindAndRun-ExcelMacroByModule.ps1 `
    -ModuleName Module1 -ProcName DoWork
#>

[CmdletBinding(DefaultParameterSetName='ByName')]
param(
  # === ByName�i�ꗗ/���O�w��j===
  [Parameter(Mandatory=$true, ParameterSetName='ByName')]
  [string]$ModuleName,

  [Parameter(ParameterSetName='ByName')]
  [string]$ProcName,

  [Parameter(ParameterSetName='ByName')]
  [string]$WorkbookName,

  [Parameter(ParameterSetName='ByName')]
  [string]$BasPath,

  [Parameter(ParameterSetName='ByName')]
  [ValidateSet("JSON")]
  [string]$ListOutput = "JSON",

  # === ByQualified�i���S�C���ő����s�j===
  [Parameter(Mandatory=$true, ParameterSetName='ByQualified')]
  [string]$Qualified,

  # === ���ʃX�C�b�` ===
  [Parameter(ParameterSetName='ByName')]
  [Parameter(ParameterSetName='ByQualified')]
  [switch]$ActivateExcel,

  [Parameter(ParameterSetName='ByName')]
  [Parameter(ParameterSetName='ByQualified')]
  [switch]$ShowVBE,

  [Parameter(ParameterSetName='ByName')]
  [Parameter(ParameterSetName='ByQualified')]
  [switch]$ShowStatus
)

$ErrorActionPreference = 'Stop'
# --- �o�͂̕��������΍�iUTF-8�j ---
try {
  [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
  $OutputEncoding = [System.Text.Encoding]::UTF8
} catch {}

# ���ʃ��[�e�B���e�B ExcelUtil.ps1 �𓯍��f�B���N�g������ǂݍ���
$utilPath = Join-Path $PSScriptRoot 'ExcelUtil.ps1'
if (-not (Test-Path -LiteralPath $utilPath)) {
  Write-Output (ConvertTo-Json @{ ok=$false; error="ExcelUtil.ps1 not found"; path=$utilPath })
  exit 0
}

. $utilPath   # �� dot-source�i�K����Ɏ��s�����ʒu�Ɂj

# COM �Ď��s�w���p�i���ɂ���Ώd����`���Ȃ��j
if (-not (Get-Command Invoke-Com -ErrorAction SilentlyContinue)) {
  function Invoke-Com {
    param([scriptblock]$Action, [int]$MaxTry = 50, [int]$DelayMs = 150)
    for ($i=0; $i -lt $MaxTry; $i++) {
      try { return & $Action } catch [System.Runtime.InteropServices.COMException] {
        if ($_.Exception.HResult -eq -2147418111) { Start-Sleep -Milliseconds $DelayMs; continue } # RPC_E_CALL_REJECTED
        throw
      }
    }
    throw "COM �Ăяo���̍Ď��s������ɒB���܂���"
  }
}


# Excel ���f�B�҂�
if (-not (Get-Command Wait-ExcelReady -ErrorAction SilentlyContinue)) {
  function Wait-ExcelReady { param($App, [int]$TimeoutSec = 20)
    $sw = [Diagnostics.Stopwatch]::StartNew()
    while ($sw.Elapsed.TotalSeconds -lt $TimeoutSec) {
      try {
        if ((Invoke-Com { $App.Ready }) -and (Invoke-Com { $App.Interactive })) { return }
      } catch {}
      Start-Sleep -Milliseconds 200
    }
  }
}

# User32 ��`���Ȃ���Βǉ�
if (-not ("User32" -as [type])) {
  Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public static class User32 {
  [DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr hWnd, int nCmdShow);
}
"@
}

# Microsoft.VisualBasic �����[�h�iAppActivate�p�j
if (-not ("Microsoft.VisualBasic.Interaction" -as [type])) {
  Add-Type -AssemblyName Microsoft.VisualBasic
}

# === ���C������ ===
[MessageFilter]::Register()
try {
  $excel = Get-ExcelSafe
  Wait-ExcelReady -App $excel

  # Qualified�w��𔻒肵�Ď��s
  if (-not [string]::IsNullOrWhiteSpace($Qualified)) {
    if ($ActivateExcel) { 
      Show-ExcelFront -Excel $excel
    }
    if ($ShowVBE) {
      try {
        $excel.VBE.MainWindow.Visible = $true 
      } catch {}
    }
    try {
      Wait-ExcelReady -App $excel
      Invoke-Com { $excel.Run($Qualified) } | Out-Null
      Write-Output (ConvertTo-Json @{ ok = $true; ran = $Qualified } -Depth 5)
      return
  #    exit 0
    } catch {
      Write-Output (ConvertTo-Json @{ ok = $false; ran = $Qualified; lastError = "$($_.Exception.Message)" } -Depth 8)
      return
  #    exit 0
    }
  }

  # BasPath ��v�Ńu�b�N�����ł���Ȃ�D��
  $targetWb = $null
  if ($BasPath) {
    $targetWb = Find-DetectWorkbookByBas -Excel $excel -ModuleName $ModuleName -BasPath $BasPath
  }

  $results = @()
  $wbs = Invoke-Com { @($excel.Workbooks) }
  foreach ($wb in $wbs) {
    if ($null -ne $targetWb -and ($wb.Name -ne (Invoke-Com { $targetWb.Name }))) { continue }
    try {
      $vbp = Invoke-Com { $wb.VBProject }
      $comps = Invoke-Com { @($vbp.VBComponents) }
      foreach ($c in $comps) {
        if ((Invoke-Com { $c.Name }) -ne $ModuleName) { continue }
        $results += Get-ModulePublicSubs -VBComponent $c -WorkbookName (Invoke-Com { $wb.Name })
      }
    } catch {
      # VBE �ւ̃A�N�Z�X���������ꍇ��
      continue
    }
  }

  if ($ProcName) {
    # ���s�v��
    if (-not $results -or -not ($results | Where-Object { $_.Proc -eq $ProcName })) {
      Write-Output ("{0}" -f (ConvertTo-Json @{ error="macro not found"; module=$ModuleName; proc=$ProcName; count=$results.Count } -Depth 5))
      exit 1
    }

    # �����i��
    $filtered = $results | Where-Object { $_.Proc -eq $ProcName }

    # WorkbookName ���w�肳��Ă����炳��ɍi�荞��
    if ($WorkbookName) {
        $filtered = $filtered | Where-Object { $_.WorkbookName -eq $WorkbookName }
    }

    if (-not $filtered -or $filtered.Count -eq 0) {
        Write-Output (ConvertTo-Json @{ ok=$false; error="macro not found"; module=$ModuleName; proc=$ProcName; workbook=$WorkbookName; count=$results.Count } -Depth 6)
        exit 0
    }

    # ���s�Ώۂ����߂�iBasPath�œ��肳��Ă���΂��̃u�b�N�A�����łȂ���΍ŏ��̈�v�j
    ##$target = $results | Where-Object { $_.Proc -eq $ProcName } | Select-Object -First 1
    # ���ŏ��̈�v�i������ Book2 ���w�肳��Ă���� Book2 �����c��j
    $target = $filtered | Select-Object -First 1
    #$wbName = $target.WorkbookName
    $qual   = $target.Qualified  # ��F'Book1.xlsm'!Module1.DoWork

    $qual = $target.Qualified  # ��F'Book1.xlsm'!Module1.aaa

    function Invoke-MacroRobust {
      param([object]$Excel, [string]$Qualified, [string]$Module, [string]$Proc)

      $tryForms = @(
      $Qualified,                   # 'Book1.xlsm'!Module1.aaa
      "$Module.$Proc",              # Module1.aaa
      $Proc                         # aaa
      )

      foreach ($form in $tryForms) {
        Write-Host "[DBG] Trying form: <$form>"
        try {
          Wait-ExcelReady -App $Excel
          Invoke-Com { $Excel.Run($form) } | Out-Null
          return @{ ok = $true; ran = $form }
        } catch {
          $msg = $_.Exception.Message
          $hr  = if ($_.Exception.HResult) { ('0x{0:X8}' -f ($_.Exception.HResult -band 0xffffffff)) } else { $null }
          # 1004�i�����^�C���G���[�j���͎��̕\�L�Ń��g���C
          $last = @{ tried = $form; error = $msg; hresult = $hr }
        }
      }
      return @{ ok = $false; ran = $Qualified; lastError = $last }
   }

    # ���s���O
    if ($ActivateExcel) {
      Show-ExcelFront -Excel $excel
    }
    if ($ShowVBE) {
      try { $excel.VBE.MainWindow.Visible = $true } catch {}
    }
    if ($ShowStatus) {
      try { $excel.StatusBar = "Running $ModuleName.$ProcName ..." } catch {}
    }

    #$result = Invoke-MacroRobust -Excel $excel -Qualified $qual -Module $ModuleName -Proc $ProcName
    # ���t�H�[���o�b�N�֎~�FQualified �������s
    try {
        Wait-ExcelReady -App $excel
        Invoke-Com { $excel.Run($qual) } | Out-Null
        $result = @{ ok = $true; ran = $qual }
    } catch {
        $result = @{ ok = $false; ran = $qual; lastError = $_.Exception.Message }
    }

    # ���s��
    if ($ShowStatus) {
      try {
        $msg = if ($result.ok) { "Done: $($result.ran)" } else { "Failed: $($result.ran)" }
        Invoke-Com { $excel.StatusBar = $msg } | Out-Null
        Start-Sleep -Milliseconds 800
        Invoke-Com { $excel.StatusBar = $null } | Out-Null
      } catch {}
    }
    
    Write-Output (ConvertTo-Json $result -Depth 8)
    exit 0   # �� ���s�ł� 0 �ŏI���iNode ���� JSON ��K���󂯎���j

  }
  else {
    # �ꗗ�o��
    if ($ListOutput -eq "JSON") {
      Write-Output (ConvertTo-Json $results -Depth 5)
    } else {
      $results | Format-Table -AutoSize
    }
  }

} finally {
  [MessageFilter]::Revoke()
}
