# GitHub-қа жүктеу (терминал арқылы)

1. Терминалды ашып жоба папкасына кіріңіз:
   ```
   cd "c:\Users\Бекарыс\Documents\HTML\BiologyTwo"
   ```

2. Git инициализация және алғашқы коммит:
   ```
   git init
   git add .
   git commit -m "Алғашқы жүктеу"
   ```

3. GitHub-та жасаған репозиторийді "remote" қосыңыз (YOUR_USERNAME және BiologyTwo орнына өз логиніңізді жазыңыз):
   ```
   git remote add origin https://github.com/YOUR_USERNAME/BiologyTwo.git
   ```

4. Жіберу:
   ```
   git branch -M main
   git push -u origin main
   ```
   (Кіру сұрағанда GitHub логин/пароль немесе токен енгізіңіз.)
