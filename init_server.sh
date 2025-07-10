sudo apt install git
sudo apt install python3
sudo apt install python3-venv
sudo apt install npm
(cd backend; if [[ -f mcfscan ]]; then
    source mcfscan/bin/activate
else
    python3 -m venv mcfscan
fi && pip install -r requirements.txt)
(cd frontend ; npm install)
printf "\n\n\nINFO: Serveur initialiser avec succes\n"