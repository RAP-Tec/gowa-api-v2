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
  const reversed = input.split('').reverse().join(''); 
  const lowerCase = reversed.toLowerCase(); 
  const withDashes = lowerCase.match(/.{1,8}/g)?.join('-') || lowerCase; 
  return withDashes; 
}

// Outras funções relacionadas à autenticação podem ser adicionadas aqui