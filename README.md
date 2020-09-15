# drawing
![aaa](https://github.com/Gen-Arch/aws-drawing/blob/master/master.png)

# 注意事項
事前に下記を用意してください。
- 踏み台アクセス用のキーペア
- 踏み台らか各種サーバーに入るためのキーペア（名前はbastion）
- 踏み台サーバー用AMI

# install
module install
```
npm install
```

# configure
## copy config file
```
cp cdk.json.sample cdk.json
cp env.sh.sample env.sh
```

## edit config file
Please rewrite the contents of the file to your environment
```
vim cdk.json
vim env.sh
```

# deploy
```
cdk synth -c env=<environment>
cdk diff -c env=<environment>
cdk deploy -c env=<environment>
```
