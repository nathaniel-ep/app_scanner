sudo apt install python3
sudo apt install python3-venv
sudo apt install python3-pip
(cd backend; if [[ -d bin ]]; then
    source bin/activate
else
    python3 -m venv . && source bin/activate
fi ; pip install -r requirements.txt)