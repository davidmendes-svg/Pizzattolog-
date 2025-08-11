// ====== BOTÕES ======
btnAdicionarColaborador.onclick = () => {
  acaoAtual = "colaborador";
  abrirModalSenha(); // só abre o modal de senha
};

btnAdicionarDialogo.onclick = () => {
  acaoAtual = "dialogo";
  abrirModalSenha(); // só abre o modal de senha
};

// ====== CONFIRMAÇÃO DE SENHA + LOGIN SUPABASE ======
btnConfirmarSenha.onclick = async () => {
  const senha = inputSenha.value.trim();

  if (senha === SENHA_UNICA) {
    // Faz login somente quando a senha estiver correta
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: "david.mendes@pizzattolog.com.br", // email do usuário criado no Supabase Auth
      password: "mend123"          // senha do usuário criado no Supabase Auth
    });

    if (loginError) {
      alert("Erro ao autenticar no Supabase: " + loginError.message);
      return;
    }

    const acao = acaoAtual;
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
};
