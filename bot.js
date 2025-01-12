const Discord = require('discord.js');
const client = new Discord.Client(1294828604001226814);//conexão com o cliente e as outras são todas requisições de libs/api
const config = require('./config.json');
const fs = require('fs');
//criando um novo Mapa de chave/valor
//https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Map
const map = new Map();

//Evento da inicialização. Esse evento é importante, mesmo que não haja nada dentro, ele é necessário para que o bot seja inicializado
client.on("ready",() =>{
    console.log("Sonoplasta online!");
    client.user.setPresence({ game: { name: 'Uma rave no Discord!', type: 1, url: 'https://www.youtube.com/onnigumo'} });
    //0 = Jogando
    //  1 = Transmitindo
    //  2 = Ouvindo
    //  3 = Assistindo
});
//evento para a alteração de estado de voz
client.on('voiceStateUpdate',(oldMember,newMember)=>{
    //verificamos se o bot está conectado e se ao mesmo tempo ele está sozinho na sala. Caso sim, ele sairá da mesma
    if(client.guilds.get(oldMember.guild.id).me.voiceChannel && client.guilds.get(oldMember.guild.id).me.voiceChannel.members.size<2){
        client.guilds.get(oldMember.guild.id).me.voiceChannel.leave();
        map.delete(oldMember.guild.id);
    }
    //caso o bot seja desconectado por algum adm, ele vai deletar os dados que tinham relacionado aquela guild
    //pois é inútil guardar em memória, algo que não vai ser mais usado
    else if(!client.guilds.get(oldMember.guild.id).me.voiceChannel && map.get(oldMember.guild.id)){
        map.delete(oldMember.guild.id);
        console.log('map da guild '+oldMember.guild.name+' deletado');
    }
})

//evento que é disparado sempre que há alterações no chat da sua guild
client.on("message", async message=>{
    //a seguir uma lista de condicionais preventivas:
    //pra evitar que seu bot responda outros
    if(message.author.bot) return;
    //evita que o bot responda comando por Mensagens Diretas (DM)
    if(message.channel.type === "dm") return;
    if(!message.content.startsWith(config.prefix)) return;
    
    /*De forma resumida aqui separamos o argumento (message.content) do prefixo. Se quiser aprender melhor o que está acontecendo parte por parte acesse os links:
    - https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/String/slice
    - https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/String/trim
    - https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/String/split 
    */
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    //aqui pegamos somente o comando usado (sem o prefixo)
    const comando = args.shift().toLowerCase();
    
    /*É sempre bom separar uma aplicação por funcionalidades, pra evitar que fique tudo em um só arquivo 
    e consequantemente você fique perdido por causa da ilegibilidade, por isso vamos usar a lib file-system*/
    //na linha a seguir é feita a leitura da pasta comandos
    try {
        let opts = {
           dev:'234311548158476288',
           map:map
        }
        //if(message.author.id!==opts.dev)return message.reply('estou em manutenção no momento!')
        fs.readdir('./comandos', (err, files) => {
    
            if (err) console.log(err);
            //aqui procuramos os carquivos que contém js no final. Ou seja, arquivos fonte de JavaScript
            let jsFile = files.filter(f => f.split('.').pop() === "js");
            console.log(jsFile);
            //caso não haja nenhum arquivo js na pasta, será printado um aviso no console
            if (jsFile.length <= 0) {
                console.log("Comando não encontrado :c");
                return;
            }
            //usamos um forEach pra percorrer a matriz de jsfile
            jsFile.forEach((f) => {
                let pull = require(`./comandos/${f}`);
                console.log(`${f} carregado`);
                //Essa condicional verifica se há um comando nos modulos igual ao que você executou. Caso sim, ele será executado
                if (pull.config.aliases.includes(comando)) pull.run(client, message, args, opts);
            });
        });
    } catch (error) {
        console.log(error);
    }
    

    
    
});

client.login(config.token);
