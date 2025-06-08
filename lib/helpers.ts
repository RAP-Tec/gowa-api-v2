/**
 * Funções auxiliares
 */
/**
 * Converte uma string de chave de autenticação para um formato específico
 * converte a chave de autenticação do header apiKeyFromHeader, invertendo a API_KEY e passando para minúsculas, e adicionando traços a cada 8 caracteres
 * @param input String de entrada para conversão
 * @returns String convertida
 */
export function convAuthKey(input: string): string {
  // 1. Remove todos os hífens da string de entrada
  const withoutDashes = input.replace(/-/g, '');
  // 2. Reverte a string
  const reversed = withoutDashes.split('').reverse().join('');
  // 3. Converte para minúsculas
  const lowerCase = reversed.toLowerCase();
  // 4. Adiciona hífens a cada 8 caracteres
  const withDashes = lowerCase.match(/.{1,8}/g)?.join('-') || lowerCase;
  return withDashes;
}

// Outras funções relacionadas à autenticação podem ser adicionadas aqui