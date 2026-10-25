<#
.SYNOPSIS
    Configures VirtualBox network adapters for the Packet Ninja Home Lab.
.DESCRIPTION
    Applies the course network topology to VirtualBox VMs:
    - Sets Adapter 1 to Internal Network "labnet" with Promiscuous Mode "allow-all" on all VMs.
    - Configures Adapter 2 as NAT on Kali and Ubuntu Server for updates.
    - Disables all secondary adapters on Metasploitable2 for security.
.NOTES
    Run from an Administrator or standard PowerShell console where VBoxManage is accessible.
#>

$ErrorActionPreference = "Stop"

# Verify VBoxManage is available
$vboxManagePath = "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe"
if (-not (Get-Command "VBoxManage" -ErrorAction SilentlyContinue)) {
    if (Test-Path $vboxManagePath) {
        $env:Path += ";C:\Program Files\Oracle\VirtualBox"
        Write-Host "[+] Added VirtualBox directory to PATH." -ForegroundColor Green
    } else {
        Write-Error "VBoxManage.exe not found! Please verify VirtualBox installation path."
    }
}

Write-Host "=== Packet Ninja Lab Network Configuration ===" -ForegroundColor Cyan

# 1. Configure Kali Linux
Write-Host "`n[*] Configuring 'kali'..." -ForegroundColor Yellow
try {
    VBoxManage modifyvm "kali" --nic1 intnet --intnet1 "labnet" --nicpromisc1 allow-all
    VBoxManage modifyvm "kali" --nic2 nat
    Write-Host "    [+] Adapter 1: Internal Network 'labnet' (Promiscuous: Allow All)" -ForegroundColor Green
    Write-Host "    [+] Adapter 2: NAT (Internet access for updates)" -ForegroundColor Green
} catch {
    Write-Warning "VM 'kali' not found in VirtualBox. Verify VM name."
}

# 2. Configure Ubuntu Server
Write-Host "`n[*] Configuring 'ubuntu-srv'..." -ForegroundColor Yellow
try {
    VBoxManage modifyvm "ubuntu-srv" --nic1 intnet --intnet1 "labnet" --nicpromisc1 allow-all
    VBoxManage modifyvm "ubuntu-srv" --nic2 nat
    Write-Host "    [+] Adapter 1: Internal Network 'labnet' (Promiscuous: Allow All)" -ForegroundColor Green
    Write-Host "    [+] Adapter 2: NAT (Internet access for updates)" -ForegroundColor Green
} catch {
    Write-Warning "VM 'ubuntu-srv' not found in VirtualBox. Verify VM name."
}

# 3. Configure Metasploitable 2 (CRITICAL: NEVER ATTACH NAT TO MSF2!)
Write-Host "`n[*] Configuring 'metasploitable2'..." -ForegroundColor Yellow
try {
    VBoxManage modifyvm "metasploitable2" --nic1 intnet --intnet1 "labnet" --nicpromisc1 allow-all
    VBoxManage modifyvm "metasploitable2" --nic2 none
    VBoxManage modifyvm "metasploitable2" --nic3 none
    VBoxManage modifyvm "metasploitable2" --nic4 none
    Write-Host "    [+] Adapter 1: Internal Network 'labnet' (Promiscuous: Allow All)" -ForegroundColor Green
    Write-Host "    [+] Secondary Adapters: STRICTLY DISABLED (Security requirement)" -ForegroundColor Green
} catch {
    Write-Warning "VM 'metasploitable2' not found in VirtualBox. Verify VM name."
}

# 4. Configure Windows Client (Optional)
Write-Host "`n[*] Configuring 'win-client' (Optional)..." -ForegroundColor Yellow
try {
    VBoxManage modifyvm "win-client" --nic1 intnet --intnet1 "labnet" --nicpromisc1 allow-all
    Write-Host "    [+] Adapter 1: Internal Network 'labnet' (Promiscuous: Allow All)" -ForegroundColor Green
} catch {
    Write-Host "    [-] VM 'win-client' not present (Skipping optional workstation)." -ForegroundColor Gray
}

Write-Host "`n[+] All lab network interfaces successfully configured!" -ForegroundColor Cyan
Write-Host "[!] Start your VMs and proceed with Module 00.04 Verification." -ForegroundColor White
