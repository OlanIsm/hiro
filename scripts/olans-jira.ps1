<#
.SYNOPSIS
    Launcher script for Olan's Jira on Windows PowerShell.
.DESCRIPTION
    Checks if Olan's Jira server is already running, starts the production server
    bound to 127.0.0.1, prevents duplicate processes, and opens the default web browser.
#>

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$RootDir = Split-Path -Parent $ScriptDir

Set-Location $RootDir
node scripts/launcher.mjs
