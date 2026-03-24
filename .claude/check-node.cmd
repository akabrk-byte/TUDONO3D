@echo off
dir "C:\Program Files (x86)\nodejs\" > "G:\Users\alecs\Downloads\tudono3d\.claude\node-check.txt" 2>&1
dir "C:\Program Files\nodejs\" >> "G:\Users\alecs\Downloads\tudono3d\.claude\node-check.txt" 2>&1
where node >> "G:\Users\alecs\Downloads\tudono3d\.claude\node-check.txt" 2>&1
where npm >> "G:\Users\alecs\Downloads\tudono3d\.claude\node-check.txt" 2>&1
