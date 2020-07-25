# Imagem base
FROM node:14-alpine

# Configuração do usuário/permissões
USER node
WORKDIR /home/node/

# Instalação das dependências
COPY package.json .
COPY yarn.lock .
RUN yarn install

# Copia dos arquivos do projeto
COPY . .

# Execução
CMD ["yarn", "test"]