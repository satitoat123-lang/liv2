git init > git_log.txt 2>&1
git add README.md >> git_log.txt 2>&1
git commit -m "first commit" >> git_log.txt 2>&1
git branch -M main >> git_log.txt 2>&1
git remote add origin https://github.com/satitoat123-lang/liv2.git >> git_log.txt 2>&1
git push -u origin main >> git_log.txt 2>&1
