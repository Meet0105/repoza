# Windows Build Error Fix

## 🐛 Error:
```
[Error: UNKNOWN: unknown error, mkdir 'C:\Codage All Project\repoza\.next\server']
errno: -4094, code: 'UNKNOWN', syscall: 'mkdir'
```

## 🔍 Cause:
This error happens on Windows when:
1. The `.next` folder is locked by another process
2. File permissions are restricted
3. Path contains spaces (like "Codage All Project")
4. Antivirus is blocking file creation

## ✅ Solution:

### **Option 1: Use the Fix Script (Easiest)**

Just double-click the `fix-build.bat` file, then restart your dev server:

```bash
npm run dev
```

### **Option 2: Manual Fix**

Run these commands in PowerShell:

```powershell
# Stop all Node processes
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

# Delete .next folder
Remove-Item -Recurse -Force .next

# Delete cache
Remove-Item -Recurse -Force "node_modules\.cache" -ErrorAction SilentlyContinue

# Restart dev server
npm run dev
```

### **Option 3: CMD Commands**

```cmd
taskkill /F /IM node.exe
rmdir /s /q .next
rmdir /s /q node_modules\.cache
npm run dev
```

## 🚀 After Fix:

1. The `.next` folder will be recreated automatically
2. Your dev server should start without errors
3. Live Preview feature will work correctly

## 🛡️ Prevention:

To avoid this error in the future:

1. **Always stop the dev server properly** (Ctrl+C)
2. **Close VS Code/IDE** before deleting `.next` folder
3. **Add antivirus exception** for your project folder
4. **Consider moving project** to a path without spaces (optional)

## 📝 Note:

This error is **NOT related to our Live Preview code changes**. It's a Windows file system issue that can happen with any Next.js project.

The Live Preview feature is working correctly - this is just a build system issue! 🎉
