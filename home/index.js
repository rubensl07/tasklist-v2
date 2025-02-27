'use strict'

//Importar elementos do HTML
const adicionarTarefaPage = document.getElementById('adicionarTarefaPage')
const tarefaEditPage = document.getElementById('editarTarefaPage')
const tarefaComentariosPage = document.getElementById('comentariosPage')
const botaoLogout = document.getElementById('logout')
const filtroButton = document.getElementById('filtroButton')
const closePanelNovaTarefa = document.getElementById('botaoFecharPainelNovaTarefa')
const closePanelEditarTarefa = document.getElementById('botaoFecharPainelEditarTarefa')
const closePanelComentarios = document.getElementById('botaoFecharPainelComentarios')
const mensagemWarning = document.getElementById('mensagemInfoWarning');
const listaTarefas = document.getElementById('tarefas')
const listaComentarios = document.getElementById('comentarios')
const botaoAdicionarComentario = document.getElementById('botaoAdicionarComentario')
const premiumIcon = document.getElementById('premiumIcon')
const tituloTarefaNova = document.getElementById('tituloTarefaNova')
const descricaoTarefaNova = document.getElementById('descricaoTarefaNova')
const dataTarefaNova = document.querySelector("#dataTarefaNova")
const tituloTarefaEditada = document.getElementById('tituloTarefaEditada')
const descricaoTarefaEditada = document.getElementById('descricaoTarefaEditada')
const dataTarefaEditada = document.querySelector("#dataTarefaEditada")
const funcoesPremium = async () => {
    const premium = await validarPremium()
    const admin = await validarAdmin()
    if(premium){
        premiumIcon.src='../img/diamond.png'
        const containerTarefas = document.getElementById('containerTarefas')
        containerTarefas.style.height= '70%';
        const buttonAdicionarTarefa = document.getElementById('buttonAdicionarTarefa')
        buttonAdicionarTarefa.style.display='block'
    }
    if(admin){
        premiumIcon.src='../img/unlock.png'
    }
};
funcoesPremium()

//Criando variáveis para o projeto
let filtro = 0;
let comentarioAberto = 0
let comentarioSendoFeito = false

//Capturando qual usuário está atualmente logado.
const idPerfil = parseInt(localStorage.getItem('idusuario'))
//Caso não aja usuário logado, o usuário é direcionado para a tela de login
if (!idPerfil) {
    window.location.href = '../login/login.html'
}

//Capturando as infos do Back-end
async function capturarListaUsuarios() {
    const responseApi = await fetch('http://localhost:5082/usuario')
    const listUsers = await responseApi.json()

    return (listUsers)
}
async function capturarListaTarefas() {
    const responseApi = await fetch('http://localhost:5082/tarefas')
    const listTasks = await responseApi.json()

    return (listTasks)
}
async function capturarListaComentarios() {
    const responseApi = await fetch('http://localhost:5082/comentarios')
    const listComents = await responseApi.json()

    return (listComents)
}
async function capturarLikes() {
    const responseApi = await fetch('http://localhost:5082/curtidas')
    const listLikes = await responseApi.json()

    return (listLikes)
}
async function capturarLikesUsuario() {
    const responseApi = await fetch('http://localhost:5082/curtidas')
    const listLikes = await responseApi.json()
    let listaLikesUsuario = []
    listLikes.forEach(like => {
        if(like.idUsuario == idPerfil){
            listaLikesUsuario.push(like)
        }
    });
    return (listaLikesUsuario)
}
atualizarPagina()

//Funções de validação
async function validarAdmin(){
    const listUsers = await capturarListaUsuarios()
    let adminBoolean = false
    listUsers.forEach((user) => {
        if (user.id == idPerfil) {
            if(user.admin){
                adminBoolean = true
            }
        }
    })
    return(adminBoolean)
}
async function validarPremium(){
    const listUsers = await capturarListaUsuarios()
    let premiumBoolean = false
    listUsers.forEach((user) => {
        if (user.id == idPerfil) {
            if(user.premium){
                premiumBoolean = true
            }
        }
    })
    return(premiumBoolean)
}

botaoLogout.addEventListener('click', ()=>{
    localStorage.removeItem('idusuario')
    window.location.reload()
})

//Adicionar/Remover Premium
premiumIcon.addEventListener('click',async()=>{
    if(await validarPremium()){
        const confirmacao = confirm('Remover premium?');
        if(confirmacao){
            let statusAtualizado
            const listaUsuarios = await capturarListaUsuarios()
            listaUsuarios.forEach((usuario) => {
                if(usuario.id == idPerfil){
                    statusAtualizado = {
                        nome: usuario.nome,
                        email: usuario.email,
                        senha: usuario.senha,
                        premium: false
                    };
                }
            });

            try {
                await fetch(`http://localhost:5082/usuario/${idPerfil}`, {
                    method: 'PUT', 
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(statusAtualizado)
                });
                console.log('Premium retirado com sucesso!');
            } catch (error) {
                console.error('Ocorreu um erro ao retirar o premium: ', error);
            }
        }
    } else if(!(await validarAdmin())){
        window.location.href='../upgradePage/index.html'
    }
})

filtroButton.addEventListener('click',()=>{
    filtro++
    if(filtro==5){
        filtro=0
    }
    atualizarPagina()
}) 

async function criarTarefa(infoTarefas) {
   
    const tarefa = document.createElement('div')
    tarefa.classList.add('tarefa')
    tarefa.classList.add(verificarCategoria(infoTarefas.categoria))
   
    const tarefaTop = document.createElement('div')
    tarefaTop.classList.add('tarefaTop')
    tarefaTop.classList.add('top')

    const tituloTarefa = document.createElement('p')
    tituloTarefa.classList.add('tituloTarefa')
    tituloTarefa.textContent = infoTarefas.titulo

    const tarefaTopRight = document.createElement('div')
    tarefaTopRight.classList.add('tarefaTopRight')

    const likeButton = document.createElement('img')
    likeButton.classList.add('imgIcon')
    const statusCurtido = await verificarStatusCurtido(infoTarefas.id)
    if(statusCurtido){
        likeButton.src = "../img/heart.png"
    } else {
        likeButton.src = "../img/heart_bw.png"
    }

    const likeCount = document.createElement('p')
    const quantidadeCurtidas = await verificarQuantidadeCurtidas(infoTarefas.id)
    if (quantidadeCurtidas>0){
        likeCount.textContent = quantidadeCurtidas 

    }
    likeCount.classList.add('likeCount')
    

    const warningIcon = document.createElement('img')
    warningIcon.src = "../img/warning.png"
    warningIcon.classList.add('warningIcon')
    warningIcon.addEventListener('mouseover', () => {
        mensagemWarning.style.display = 'block';
    });
    warningIcon.addEventListener('mouseout', () => {
        mensagemWarning.style.display = 'none';
    });



    const date = document.createElement('p')
    const dateSplits = infoTarefas.data.split('-');
    date.textContent = dateSplits[2] + '/' + dateSplits[1];
    date.classList.add('date')

    const trashIcon = document.createElement('img')
    trashIcon.src = "../img/trashIcon.png"
    trashIcon.classList.add('imgIcon')
    
    const editIcon = document.createElement('img')
    editIcon.src = "../img/editIcon.png"
    editIcon.classList.add('imgIcon')

    const commentIcon = document.createElement('img')
    commentIcon.src = "../img/commentIcon.png"
    commentIcon.classList.add('imgIcon')

    const tarefaBottom = document.createElement('div')
    tarefaBottom.classList.add('tarefaBottom')
    
    const tarefaDescricao = document.createElement('p')
    tarefaDescricao.classList.add('tarefaDescricao')
    tarefaDescricao.textContent = infoTarefas.descricao

    const tarefaCategoria = document.createElement('div')
    tarefaCategoria.classList.add('tarefaCategoria')

    const categoriaIcon = document.createElement('img')


    if(infoTarefas.categoria)
    categoriaIcon.src = "../img/tarefasIcon/" + verificarCategoria(infoTarefas.categoria) + ".png"


    tarefaCategoria.appendChild(categoriaIcon)
    tarefaBottom.appendChild(tarefaDescricao)
    tarefa.appendChild(tarefaTop)

    if(!infoTarefas.descricao){
        if(infoTarefas.categoria){
            tarefaTopRight.appendChild(tarefaCategoria)
        }
        tarefaTop.style.borderRadius = "26px";
    } else {
        tarefa.appendChild(tarefaBottom)
        if(infoTarefas.categoria){
            tarefaBottom.appendChild(tarefaCategoria)
        }
    }

    tarefaTopRight.appendChild(likeCount)
    tarefaTopRight.appendChild(likeButton)

    if(infoTarefas.data){
        if (verificarData(dateSplits[0] + dateSplits[1] + dateSplits[2])) {
            tarefaTopRight.appendChild(warningIcon)
            date.style.color='orange'
        }
        tarefaTopRight.appendChild(date)
    }
    if(await validarPremium()){
        tarefaTopRight.appendChild(editIcon)
        tarefaTopRight.appendChild(trashIcon)
    }
    if(await validarAdmin()){
        tarefaTopRight.appendChild(trashIcon)
    }
    tarefaTopRight.appendChild(commentIcon)
    tarefaTop.appendChild(tituloTarefa)
    tarefaTop.appendChild(tarefaTopRight)
    listaTarefas.appendChild(tarefa)
    if(statusCurtido){
        likeButton.addEventListener('click', () => removerCurtida(infoTarefas.id))
    } else {
        likeButton.addEventListener('click', () => darCurtida(infoTarefas.id))
    }
    editIcon.addEventListener('click', () => callEditarTarefaPage(infoTarefas.id));
    trashIcon.addEventListener('click', () => deletarTarefa(infoTarefas.id));
    commentIcon.addEventListener('click', () => criarComentarios(infoTarefas.id))
}

function verificarCategoria(categoria) {
    if (categoria == 1) {
        return "pessoal"
    }
    if (categoria == 2) {
        return "trabalho"
    }
    if (categoria == 3) {
        return "casa"
    }
    if (categoria == 4) {
        return "saude"
    }
}
function verificarData(dataTarefa) {
    //Verifica se a data já foi ultrapassada
    const DATE = new Date();
    let dia = DATE.getDate().toString();
    let mes = (DATE.getMonth() + 1).toString();

    if (dia < 10) { mes = '0' + dia }
    if (mes < 10) { mes = '0' + mes }
    const dataAtual = DATE.getFullYear().toString() + mes + dia;
    if (dataTarefa < dataAtual) {
        return true
    } else return false
}
async function verificarStatusCurtido(idTarefa){
    let validacao = false
    const listaLikes = await capturarLikesUsuario()
    listaLikes.forEach(elementoLike => {
        if(elementoLike.idTarefa == idTarefa){
            validacao = true
        } 
    });
    return validacao
}
async function verificarQuantidadeCurtidas(idTarefa){
    const listaCurtidas = await capturarLikes()
    let quantidade = 0

    listaCurtidas.forEach(curtida => {
        if(curtida.idTarefa == idTarefa){
            quantidade++
        }
        });
    return quantidade
}

function excluirListaTarefas(){
    while (listaTarefas.firstChild) {
        listaTarefas.removeChild(listaTarefas.firstChild);
    }
}

async function editarTarefa(id) {
    const tituloVal = tituloTarefaEditada.value
    const descricaoVal = descricaoTarefaEditada.value
    const dataVal = dataTarefaEditada.value
    const inputs = document.querySelectorAll('#categoriaTarefaEditada input[type="radio"]');
    let categoria = '';
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].checked) {
            categoria = inputs[i].value;
            break; // Interrompe o loop quando encontrar o selecionado
        }
    }

    const tarefaAtualizada = {
        titulo: tituloVal,
        descricao: descricaoVal,
        data: dataVal,
        categoria: categoria,
    };

    try {
        await fetch(`http://localhost:5082/tarefas/${id}`, {
            method: 'PUT', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tarefaAtualizada)
        });
    } catch (error) {
        console.error('Ocorreu um erro ao substituir a tarefa: ', error);
    }
} 
async function deletarTarefa(id) {
    try {
        await fetch(`http://localhost:5082/tarefas/${id}`, {
            method: 'DELETE',
        });
        const listaComentarios = await capturarListaComentarios()
        listaComentarios.forEach((comment) => {
            if(comment.idTarefa == id)
            deletarComment(comment.id)
        });
    } catch (error) {
        console.error('Ocorreu um erro ao excluir a tarefa:', error);
    }
}
async function deletarComment(id){
    try {
        await fetch(`http://localhost:5082/comentarios/${id}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error('Ocorreu um erro ao excluir o comentário:', error);
    }
}

async function criarTarefas(filtro) {
    const infoTarefas = await capturarListaTarefas()
    if(filtro>0){
        for (let cont = 0; cont < infoTarefas.length; cont++) {
            if(infoTarefas[cont].categoria==filtro){
                criarTarefa(infoTarefas[cont])
            }
        }
    } else {
        for (let cont = 0; cont < infoTarefas.length; cont++) {
            criarTarefa(infoTarefas[cont])
        }
    }

}

function atualizarPagina(){
    excluirListaTarefas()
    criarTarefas(filtro)
}

async function cadastroTarefa() {

    const tituloVal = tituloTarefaNova.value
    const descricaoVal = descricaoTarefaNova.value
    const dataVal = dataTarefaNova.value
    const inputs = document.querySelectorAll('#categoriaTarefaNova input[type="radio"]');
    let categoria = '';
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].checked) {
            categoria = inputs[i].value;
            break; // Interrompe o loop quando encontrar o selecionado
        }
    }

    let [ano] = dataVal.split("-");


    if (tituloVal == "" || ano > 9999) {
        //
    } else {
        try {
            const novaTarefa = {
                titulo: tituloVal,
                descricao: descricaoVal,
                data: dataVal,
                categoria: categoria,
            }


            await fetch('http://localhost:5082/tarefas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(novaTarefa)
            })
            fecharPainel()
        } catch (error) {
            console.log(error)
        }
    }
}

function callAdicionarTarefaPage() {
    adicionarTarefaPage.style.visibility = "visible"

}
tituloTarefaNova.addEventListener('keypress',(event)=>{
    if(event.key==="Enter"){
        descricaoTarefaNova.focus()
    }
})
descricaoTarefaNova.addEventListener('keypress',(event)=>{
    if(event.key==="Enter"){
        dataTarefaNova.focus()
    }
})
closePanelNovaTarefa.addEventListener('click', ()=>{
    adicionarTarefaPage.style.visibility = "hidden"
})

async function callEditarTarefaPage(idTarefa){
    const titulo = document.getElementById('tituloTarefaEditada')
    const descricao = document.getElementById('descricaoTarefaEditada')
    const data = document.querySelector("#dataTarefaEditada")
    const inputs = document.querySelectorAll('#categoriaTarefaEditada input[type="radio"]');

    const tarefas = await capturarListaTarefas()
    for(let cont = 0;cont<tarefas.length;cont++){
        if(idTarefa===tarefas[cont].id){
            titulo.value = tarefas[cont].titulo
            descricao.value = tarefas[cont].descricao
            let dataAtual = tarefas[cont].data
            data.value = dataAtual
            if(inputs[(tarefas[cont].categoria)-1])
            inputs[(tarefas[cont].categoria)-1].checked = true
        }
    }
    tarefaEditPage.style.visibility = 'visible'

    const botaoEditar = document.getElementById('finalizarEdicao')
    botaoEditar.addEventListener('click', () => editarTarefa(idTarefa));
}
tituloTarefaEditada.addEventListener('keypress',(event)=>{
    if(event.key==="Enter"){
        descricaoTarefaEditada.focus()
    }
})
descricaoTarefaEditada.addEventListener('keypress',(event)=>{
    if(event.key==="Enter"){
        dataTarefaEditada.focus()
    }
})
closePanelEditarTarefa.addEventListener('click', ()=>{
    tarefaEditPage.style.visibility = "hidden"
})

function callComentariosPage(){
    tarefaComentariosPage.style.width='25%'
    tarefaComentariosPage.style.visibility='visible'
}
closePanelComentarios.addEventListener('click', ()=>{
    tarefaComentariosPage.style.width='0px'
    tarefaComentariosPage.style.visibility='hidden'
})

async function criarComentario(infoComment){
    const comentario = document.createElement('div')
    comentario.classList.add('comentario')
    const comentarioTop = document.createElement('div')
    comentarioTop.classList.add('comentarioTop')
    const nome = document.createElement('h3')
    nome.textContent= infoComment.nomeUsuario
    const trashIcon = document.createElement('img')
    trashIcon.src='../img/trashIcon.png'
    trashIcon.classList.add('imgIcon')
    const content = document.createElement('p')
    content.classList.add('comentarioContent')
    content.textContent = infoComment.conteudo
    trashIcon.addEventListener('click',()=>{deletarComment(infoComment.id)})
    comentarioTop.appendChild(nome)
    if(infoComment.idUsuario == idPerfil || (await validarAdmin())){
        comentarioTop.appendChild(trashIcon)
    }
    comentario.replaceChildren(comentarioTop,content)
    listaComentarios.appendChild(comentario)
}
async function criarComentarios(id){
    comentarioAberto = id
    callComentariosPage()
    excluirListaComentarios()
    excluirCampoComentario()
    const listaComents = await capturarListaComentarios()
    const listaUsuarios = await capturarListaUsuarios()
    let listaComentsTarefa = []
    for(let cont=0;cont<listaComents.length;cont++){
        if(listaComents[cont].idTarefa==id){
             listaComentsTarefa.push(listaComents[cont])
        }
    }
    let nomeUsuario = null
    listaComentsTarefa.forEach((comment) => {
        listaUsuarios.forEach((usuario) => {
            if(usuario.id==comment.idUsuario){
                nomeUsuario = usuario.nome
            }
        });
        const dados = {
            id: comment.id,
            idUsuario: comment.idUsuario,
            nomeUsuario: nomeUsuario,
            conteudo: comment.content
        }
        criarComentario(dados)
    })
}
function botaoAdicionarComentarioPressionado(){
    if(!(comentarioSendoFeito)){
        const tarefaComentariosPageTop = document.getElementById('tarefaComentariosPageTop')
        const textAreaComentario = document.createElement('textarea')
        textAreaComentario.setAttribute('placeholder','Comentário')
        textAreaComentario.classList.add('comentarioTextArea')
        const buttonComentar = document.createElement('button')
        buttonComentar.classList.add('botaoPublish')
        buttonComentar.textContent='Publicar'
        buttonComentar.addEventListener('click',()=>{comentar(textAreaComentario.value)})
        textAreaComentario.addEventListener('keypress',(event)=>{
            if(event.key==="Enter"){
                buttonComentar.click()
            }
        })
        tarefaComentariosPageTop.appendChild(textAreaComentario)
        tarefaComentariosPageTop.appendChild(buttonComentar)
        comentarioSendoFeito = true
    }
}
function excluirCampoComentario(){
    const textarea = document.querySelector('#tarefaComentariosPageTop textarea.comentarioTextArea');
    const botaoPublicar = document.querySelector('#tarefaComentariosPageTop button.botaoPublish');
    if(textarea){
        textarea.remove();
        botaoPublicar.remove();
    }
    comentarioSendoFeito = false
}
function excluirListaComentarios(){
    while (listaComentarios.firstChild) {
        listaComentarios.removeChild(listaComentarios.firstChild);
    }
}
async function comentar(comentarioContent){
    if(comentarioContent==''){
        alert("Escreva algo")
    } else {
    comentarioSendoFeito = false
    excluirCampoComentario()
    try {
        const novoComentario = {
            content: comentarioContent,
            idTarefa: comentarioAberto,
            idUsuario: idPerfil
        }
        await fetch('http://localhost:5082/comentarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(novoComentario)
        })
    } catch (error) {
        console.log(error)
    }
    }
}

async function darCurtida(idTarefa){
    try {
        const novaCurtida = {
            idTarefa: idTarefa,
            idUsuario: idPerfil
        }
        await fetch('http://localhost:5082/curtidas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(novaCurtida)
        })
    } catch (error) {
        console.log(error)
    }
}
async function removerCurtida(idTarefa){
    const listaLikes = await capturarLikesUsuario()
    let id
    listaLikes.forEach(like => {
        if (like.idTarefa == idTarefa){
            id = like.id
        }
    });


    try {
        await fetch(`http://localhost:5082/curtidas/${id}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error('Ocorreu um erro ao excluir a curtida:', error);
    }

}