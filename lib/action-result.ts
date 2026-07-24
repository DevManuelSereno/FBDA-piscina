// Contrato comum de retorno das Server Actions de CRUD (useActionState).
// mensagemSucesso é opcional — quando ausente, o chamador usa uma
// mensagem padrão genérica ao disparar o toast de sucesso.
export type ActionResult = {
  error?: string;
  success?: boolean;
  mensagemSucesso?: string;
};
