import { supabase } from './supabaseClient.js';

  const SENHA_UNICA = "mend123"; // Mantenha em mente os riscos de segurança de senha no frontend

  // Controle da ação atual após senha: 'colaborador' ou 'dialogo'
  let acaoAtual = null;

  // Elementos modais e botões
  const modalSenha = document.getElementById("modalSenha");
  const inputSenha = document.getElementById("inputSenha");
  const msgErroSenha = document.getElementById("msgErroSenha");
  const btnCancelarSenha = document.getElementById("btnCancelarSenha");
  const btnConfirmarSenha = document.getElementById("btnConfirmarSenha");

  const modalFormColaborador = document.getElementById("modalFormColaborador");
  const formColaboradorModal = document.getElementById("formColaboradorModal");
  const btnCancelarFormColaborador = document.getElementById("btnCancelarFormColaborador"); // Renomeado para evitar conflito

  const modalFormDialogo = document.getElementById("modalFormDialogo");
  const btnCancelarDialogo = document.getElementById("btnCancelarDialogo");
  const btnSalvarDialogo = document.getElementById("btnSalvarDialogo");
  const inputFotoDialogo = document.getElementById("inputFotoDialogo"); // Renomeado para consistência

  const btnAddColaborador = document.getElementById("btnAddColaborador");
  const btnAddDialogo = document.getElementById("btnAddDialogo");

  const listaFuncionarios = document.getElementById("lista-funcionarios");
  const galeriaDialogos = document.getElementById("galeriaDialogos");
  const pesquisaNomeColaboradores = document.getElementById("pesquisaNomeColaboradores");
  const filtroTurnoColaboradores = document.getElementById("filtroTurnoColaboradores");

  // Função para mostrar/esconder o campo "Outra Transportadora"
  function mostrarOutroCampo(selectElement) {
    const campoOutro = document.getElementById("campoOutro");
    if (selectElement.value === "outro") {
      campoOutro.style.display = "block";
      document.getElementById("outraTransportadora").setAttribute("required", "required");
    } else {
      campoOutro.style.display = "none";
      document.getElementById("outraTransportadora").removeAttribute("required");
      document.getElementById("outraTransportadora").value = ""; // Limpa o campo se não for "outro"
    }
  }

  // Função para esconder TODOS os modais de formulário
  function esconderTodosModaisFormulario() {
    modalFormColaborador.style.display = "none";
    modalFormDialogo.style.display = "none";
  }

  // Mostrar aba
  function mostrarAba(id, event) {
    document.querySelectorAll(".aba").forEach(e => e.classList.remove("ativa"));
    document.getElementById(id).classList.add("ativa");
    document.querySelectorAll("nav button").forEach(b => b.classList.remove("ativo"));
    if (event) event.currentTarget.classList.add("ativo");

    // Esconde todos os botões flutuantes por padrão
    btnAddColaborador.style.display = "none";
    btnAddDialogo.style.display = "none";

    // Mostra o botão flutuante relevante para a aba ativa e carrega dados
    if (id === "colaboradores") {
      btnAddColaborador.style.display = "block";
      carregarColaboradores();
    } else if (id === "dialogos") {
      btnAddDialogo.style.display = "block";
      carregarDialogos();
    } else if (id === "indicadores") {
      gerarIndicadores(); // Chama a função para gerar/atualizar os indicadores
    }
    // Esconde qualquer modal de formulário ou senha que possa estar aberto ao trocar de aba
    esconderTodosModaisFormulario();
    fecharModalSenha();
  }

  // Carregar colaboradores do Supabase
  async function carregarColaboradores() {
    const { data, error } = await supabase.from("colaboradores").select("*").order('nome');
    if (error) {
      alert("Erro ao carregar colaboradores: " + error.message);
      return;
    }
    exibirColaboradores(data);
  }

  // Mostrar colaboradores na galeria
  function exibirColaboradores(lista) {
    // Aplica filtros de pesquisa e turno
    const pesquisa = pesquisaNomeColaboradores.value.toLowerCase();
    const turnoFiltro = filtroTurnoColaboradores.value;

    const filtrados = lista.filter(c => {
      const nomeMatch = c.nome.toLowerCase().includes(pesquisa);
      const turnoMatch = turnoFiltro === "" || c.turno === turnoFiltro;
      return nomeMatch && turnoMatch;
    });

    listaFuncionarios.innerHTML = "";

    if (filtrados.length === 0) {
      listaFuncionarios.innerHTML = "<p>Nenhum colaborador encontrado.</p>";
      return;
    }

    filtrados.forEach(c => {
      const card = document.createElement("div");
      card.className = "funcionario-card";

      const img = document.createElement("img");
      img.className = "funcionario-foto";
      img.src = c.foto;
      img.alt = `Foto de ${c.nome}`;
      card.appendChild(img);

      const info = document.createElement("div");
      info.className = "funcionario-info";

      const nome = document.createElement("div");
      nome.className = "funcionario-nome";
      nome.textContent = c.nome;
      info.appendChild(nome);

      const cargo = document.createElement("div");
      cargo.className = "funcionario-cargo";
      cargo.textContent = `Cargo: ${c.cargo}`;
      info.appendChild(cargo);

      const turno = document.createElement("div");
      turno.className = "funcionario-turno";
      turno.textContent = `Turno: ${c.turno}`;
      info.appendChild(turno);

      const btnExcluir = document.createElement("button");
      btnExcluir.className = "btn-excluir";
      btnExcluir.textContent = "x";
      btnExcluir.onclick = () => {
          // Passa a ação 'excluir-colaborador' e o ID do colaborador
          abrirModalSenha('excluir-colaborador', c.id);
      };
      card.appendChild(btnExcluir);

      card.appendChild(info);
      listaFuncionarios.appendChild(card);
    });
  }

  // Event Listeners para pesquisa e filtro de colaboradores
  pesquisaNomeColaboradores.addEventListener("input", carregarColaboradores);
  filtroTurnoColaboradores.addEventListener("change", carregarColaboradores);

  // Carregar diálogos do Supabase
  async function carregarDialogos() {
    const { data, error } = await supabase.from("dialogos").select("*").order('id', { ascending: false });
    if (error) {
      alert("Erro ao carregar diálogos: " + error.message);
      return;
    }
    galeriaDialogos.innerHTML = "";
    if (data.length === 0) {
      galeriaDialogos.innerHTML = "<p>Nenhuma foto de diálogo adicionada.</p>";
      return;
    }
    data.forEach(d => {
      const img = document.createElement("img");
      img.src = d.url;
      img.alt = "Foto de diálogo";
      galeriaDialogos.appendChild(img);
    });
  }

  btnConfirmarSenha.onclick = async () => {
    const senha = inputSenha.value.trim();
    if (senha === SENHA_UNICA) {
        const acao = acaoAtual; // guarda antes de fechar
        fecharModalSenha();
        if (acao === "colaborador") {
            abrirModalColaborador();
        } else if (acao === "dialogo") {
            abrirModalDialogo();
        } else if (acao === "excluir-colaborador") {
            const colaboradorId = modalSenha.dataset.colaboradorId;
            if (colaboradorId) {
                const confirmDelete = confirm("Tem certeza que deseja excluir este colaborador?");
                if (confirmDelete) {
                    await excluirColaborador(colaboradorId);
                }
            }
        }
    } else {
        msgErroSenha.style.display = "block";
    }
}
  btnCancelarSenha.onclick = fecharModalSenha;

  // Abrir modal adicionar colaborador
  function abrirModalColaborador() {
    esconderTodosModaisFormulario();
    formColaboradorModal.reset();
    modalFormColaborador.style.display = "flex";
  }

  // Fechar modal colaborador
  btnCancelarFormColaborador.onclick = () => {
    modalFormColaborador.style.display = "none";
  }

  // Abrir modal adicionar diálogo
  function abrirModalDialogo() {
    esconderTodosModaisFormulario();
    inputFotoDialogo.value = "";
    modalFormDialogo.style.display = "flex";
  }

  // Fechar modal diálogo
  btnCancelarDialogo.onclick = () => {
    modalFormDialogo.style.display = "none";
  }

  // Enviar colaborador para Supabase
  formColaboradorModal.onsubmit = async (e) => {
    e.preventDefault();
    const nome = e.target.nome.value.trim();
    const cargo = e.target.cargo.value.trim();
    const turno = e.target.turno.value.trim();
    const fotoFile = e.target.foto.files[0];

    if (!nome || !cargo || !turno || !fotoFile) {
      alert("Preencha todos os campos!");
      return;
    }

    // Upload da foto para storage
    const fileExt = fotoFile.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `colaboradores/${fileName}`;

    let { error: uploadError } = await supabase.storage
      .from('imagens') // Certifique-se que seu bucket se chama 'imagens' ou ajuste aqui
      .upload(filePath, fotoFile);

    if (uploadError) {
      alert("Erro ao enviar foto: " + uploadError.message);
      console.error("Erro Supabase Upload:", uploadError);
      return;
    }

    // Obter URL público
    const { data: publicUrlData } = supabase.storage
      .from('imagens')
      .getPublicUrl(filePath);

    // Inserir no banco
    const { data, error } = await supabase.from('colaboradores').insert({
      nome, cargo, turno, foto: publicUrlData.publicUrl
    });

    if (error) {
      alert("Erro ao salvar colaborador: " + error.message);
      console.error("Erro Supabase Insert:", error);
      return;
    }

    modalFormColaborador.style.display = "none";
    carregarColaboradores();
    alert("Colaborador salvo com sucesso!");
  };

  // Excluir colaborador
  async function excluirColaborador(id) {
    const { error } = await supabase.from('colaboradores').delete().eq('id', id);
    if (error) {
      alert("Erro ao excluir colaborador: " + error.message);
      console.error("Erro Supabase Delete:", error);
    } else {
      alert("Colaborador excluído com sucesso!");
      carregarColaboradores();
    }
  }

  // Salvar diálogo
  btnSalvarDialogo.onclick = async () => {
    const fotoFile = inputFotoDialogo.files[0];
    if (!fotoFile) {
      alert("Selecione uma foto para enviar!");
      return;
    }

    const fileExt = fotoFile.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `dialogos/${fileName}`;

    let { error: uploadError } = await supabase.storage
      .from('imagens') // Certifique-se que seu bucket se chama 'imagens' ou ajuste aqui
      .upload(filePath, fotoFile);

    if (uploadError) {
      alert("Erro ao enviar foto: " + uploadError.message);
      console.error("Erro Supabase Upload:", uploadError);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('imagens')
      .getPublicUrl(filePath);

    const { data, error } = await supabase.from('dialogos').insert({
      url: publicUrlData.publicUrl
    });

    if (error) {
      alert("Erro ao salvar diálogo: " + error.message);
      console.error("Erro Supabase Insert:", error);
      return;
    }

    modalFormDialogo.style.display = "none";
    carregarDialogos();
    alert("Foto de diálogo salva com sucesso!");
  };

  // Eventos botões flutuantes (FABs)
  btnAddColaborador.onclick = () => abrirModalSenha("colaborador");
  btnAddDialogo.onclick = () => abrirModalSenha("dialogo");


  // Enviar formulário de Operações
  const formularioOperacoes = document.getElementById("formulario-operacoes");
  formularioOperacoes.onsubmit = async (e) => {
    e.preventDefault();

    const cte = e.target.cte.value.trim();
    const destinoOrigem = e.target.destino_origem.value.trim();
    const placa = e.target.placa.value.trim();
    const motorista = e.target.motorista.value.trim();
    let transportadora = e.target.transportadora.value;
    const outraTransportadora = e.target.outraTransportadora.value.trim();
    const pallets = parseInt(e.target.pallets.value, 10);
    const cargaDescarga = e.target.carga_descarga.value;
    const agendamento = e.target.agendamento.value;
    const inicio = e.target.inicio.value;
    const chegada = e.target.chegada.value;
    const termino = e.target.termino.value;

    // Se a transportadora selecionada for "outro", usa o valor do campo "outraTransportadora"
    if (transportadora === "outro") {
      transportadora = outraTransportadora;
    }

    if (!cte || !destinoOrigem || !placa || !motorista || !transportadora || isNaN(pallets) || !cargaDescarga || !agendamento || !inicio || !chegada || !termino) {
      alert("Por favor, preencha todos os campos do formulário de operações.");
      return;
    }

    // Inserir no banco de dados (assumindo que sua tabela se chame 'formulario')
    const { data, error } = await supabase.from('formulario').insert({
      cte,
      destino_origem: destinoOrigem,
      placa,
      motorista,
      transportadora,
      pallets,
      carga_descarga: cargaDescarga,
      agendamento,
      inicio,
      chegada,
      termino
    });

    if (error) {
      alert("Erro ao salvar operação: " + error.message);
      console.error("Erro Supabase:", error);
      return;
    }

    alert("Operação salva com sucesso!");
    formularioOperacoes.reset(); // Limpa o formulário após o envio
    mostrarOutroCampo(document.getElementById("transportadora")); // Reseta o campo "Outro"
  };

  let graficoInstancia = null; // Para armazenar a instância do gráfico e destruí-la quando necessário

  async function gerarIndicadores() {
    const { data, error } = await supabase.from("formulario").select("carga_descarga");
    if (error) {
      console.error("Erro ao carregar dados para indicadores: ", error);
      return;
    }
    const carga = data.filter(d => d.carga_descarga === "carga").length;
    const descarga = data.filter(d => d.carga_descarga === "descarga").length;

    // Destrói o gráfico existente se houver um para evitar duplicação em atualizações
    if (graficoInstancia) {
      graficoInstancia.destroy();
    }

    const ctx = document.getElementById("graficoTipo").getContext("2d");
    graficoInstancia = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Carga', 'Descarga'],
        datasets: [{ label: 'Número de Operações', data: [carga, descarga], backgroundColor: ['#4caf50', '#2196f3'] }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          title: {
            display: true,
            text: 'Operações de Carga vs Descarga'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Quantidade'
            }
          }
        }
      }
    });
  }

  // Ao carregar página, abrir aba default
  document.addEventListener('DOMContentLoaded', () => {
      mostrarAba('operacoes'); // Inicia na aba de operações
      mostrarOutroCampo(document.getElementById("transportadora")); // Garante que o campo "Outro" esteja no estado correto ao carregar
  });

window.mostrarAba = mostrarAba;
window.mostrarOutroCampo = mostrarOutroCampo;
