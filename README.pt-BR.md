# Leitor de Texto 🎙️

Um aplicativo web moderno e responsivo que converte texto em fala, permitindo que os usuários ouçam qualquer texto em voz alta com controle total sobre velocidade de reprodução.

## ✨ Características

- **Leitura de Texto em Voz Alta**: Converte qualquer texto em áudio usando a API Web Speech nativa do navegador
- **Controle de Velocidade**: Ajuste a velocidade de reprodução de 0.5x a 2.0x com o slider no desktop ou o seletor em telas móveis
- **Interface Moderna**: Design limpo e responsivo com gradiente visual atraente
- **Persistência de Dados**: Salve o texto no navegador para acessá-lo depois
- **Parada e Reprodução**: Controle total sobre a reprodução com botões intuitivos
- **Suporte a Português Brasileiro**: Detecção automática e seleção de vozes pt-BR quando disponível
- **Internacionalização**: Interface em pt-BR para acessos do Brasil e em inglês para demais regiões, mantendo URL canônica e metadados de SEO intactos
- **Design Responsivo**: Funciona perfeitamente em desktop, tablet e dispositivos móveis, usando layout em tela cheia e espaça
  mentos otimizados em telas pequenas para facilitar a leitura

## 🎨 Identidade Visual

- O logo oficial do projeto está disponível em [`public/assets/logo.svg`](public/assets/logo.svg) e é utilizado no cabeçalho do app e como favicon do site.

## 🚀 Como Usar

1. Abra a aplicação no navegador
2. Digite ou cole o texto que deseja ouvir no campo de texto
3. Clique no botão **Reproduzir** (▶) para iniciar a leitura
4. Use o controle deslizante (desktop/tablet) ou o seletor suspenso (mobile) para ajustar a velocidade de reprodução (0.5x a 2.0x)
5. Clique no botão **Parar** (⏹) para parar a reprodução
6. Clique no botão **Salvar** (💾) para guardar o texto no navegador

## 📋 Requisitos

- Navegador moderno com suporte à Web Speech API
- JavaScript habilitado

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Estilos com suporte a backdrop-filter e gradientes
- **TypeScript (ESM)**: Lógica de aplicação compilada para navegadores modernos
- **Vite**: Ferramenta de build e servidor de desenvolvimento
- **Tailwind CSS**: Framework de CSS utilitário (instalado via npm)
- **PostCSS**: Processamento e transformação de CSS
- **Ícones SVG Inline**: Ícones embutidos diretamente no markup (sem dependências externas)
- **Web Speech API**: Síntese de fala nativa do navegador
- **Jest**: Framework de testes unitários
- **Playwright**: Framework de testes end-to-end

## 📦 Dependências

Este projeto utiliza ferramentas modernas de build e dependências de desenvolvimento. Para usuários finais, nenhuma instalação é necessária - a aplicação roda diretamente no navegador.

### Dependências de Desenvolvimento

- **Vite**: Ferramenta de build e servidor de desenvolvimento
- **TypeScript**: JavaScript com tipagem estática
- **Tailwind CSS**: Framework de CSS utilitário
- **PostCSS**: Processamento de CSS
- **Jest**: Framework de testes unitários
- **Playwright**: Framework de testes end-to-end

## 🧠 Arquitetura de síntese de voz

- A aplicação agora usa uma abstração de engine (`SpeechEngine`) para desacoplar a UI dos detalhes da implementação de fala.
- A engine padrão atual é a `NativeSpeechEngine` (`window.speechSynthesis`), com estados normalizados (`started`, `paused`, `stopped`, `queued`) consumidos pela interface.
- Foi adicionada uma adapter `RttsSpeechEngine` para viabilizar a migração para `useSpeech` (`react-text-to-speech`) sem quebrar os contratos da UI.
- A `UnsupportedSpeechEngine` evita chamadas inválidas quando não há suporte de síntese no navegador, mantendo a aplicação estável.

## 🛡️ Compatibilidade e limitações

- Se a Web Speech API não estiver disponível, os comandos de reprodução são bloqueados e a aplicação exibe feedback de erro.
- A seleção de idioma/voz continua priorizando o locale ativo do i18n, com fallback seguro para vozes disponíveis.
- Diferenças entre navegadores em fila e pausa/retomada ainda podem ocorrer por limitações da própria Web Speech API.

## ✅ Estratégia de migração orientada por cobertura (>=95%)

- A migração para `useSpeech` segue gate de qualidade: módulos impactados devem manter cobertura unitária igual ou superior a 95%.
- A configuração do Jest agora aplica threshold para os módulos de engine de fala (`src/speech/*`).
- Novos testes de contrato cobrem inicialização, fluxo play/pause, persistência de velocidade, idioma via i18n e fallback sem suporte a fala.

## 📈 Métricas e privacidade

- O Google Analytics (GA4) e o Google Tag Manager agora são opt-in e só carregam após o visitante aceitar a coleta de métricas pelo controle "Ativar métricas" na interface. A preferência fica salva no `localStorage`.
- O bundle [`analytics.js`](public/analytics.js) é injetado de forma preguiçosa após o consentimento e iniciado programaticamente via `window.appAnalytics.init()`, mantendo-o fora do caminho crítico de renderização por padrão.
- O `<noscript>` do GTM permanece no `<body>` para manter o rastreamento básico quando o JavaScript estiver desabilitado.
- Para reabilitar o agendamento automático em outro cenário, defina `window.APP_ANALYTICS_AUTO_START = true` antes de carregar o `analytics.js` ou chame `window.appAnalytics.enableAutoStart()` após o bundle estar disponível.
- Após o deploy, valide que os eventos continuam chegando ao GA/GTM (ex.: modo preview do GTM ou painel em tempo real do GA) e repita o teste no PageSpeed Insights para comparar com a linha de base anterior.

## 💾 Armazenamento Local

O aplicativo salva o texto no `localStorage` do navegador, permitindo que você recupere facilmente seu conteúdo em futuras visitas.

## 🎯 Vozes Disponíveis

O aplicativo tenta selecionar automaticamente uma voz em português brasileiro (pt-BR) se disponível no seu sistema. Se nenhuma voz pt-BR for encontrada, o navegador usará a voz padrão do sistema.

## 🌐 Navegadores Suportados

- ✅ Chrome/Chromium (versão 25+)
- ✅ Firefox (versão 49+)
- ✅ Safari (versão 14.1+)
- ✅ Edge (versão 79+)
- ⚠️ Opera (com suporte parcial)

## 🧑‍💻 Desenvolvimento

### Requisitos

- **Node.js >= 22 < 23**
- **Yarn 4.10** (via Corepack)

### Configuração

1. Instale as dependências:
   ```bash
   yarn install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   yarn dev
   ```
   A aplicação estará disponível em `http://localhost:5173`

### Scripts Disponíveis

- `yarn dev` - Inicia o servidor de desenvolvimento do Vite
- `yarn build` - Gera os assets de produção (compila TypeScript e processa CSS com Vite)
- `yarn preview` - Visualiza o build de produção localmente
- `yarn test` - Executa todos os testes (unitários e e2e)
- `yarn test:unit` - Executa testes unitários com Jest (usa ambiente JSDOM)
- `yarn test:e2e` - Executa testes end-to-end com Playwright
- `yarn test:e2e:ui` - Executa testes do Playwright com modo UI

### Estrutura do Projeto

```
src/
├── app/          # Lógica principal da aplicação
├── core/         # Lógica de negócio (ex.: cálculos de velocidade)
├── utils/        # Funções utilitárias (ex.: helpers de armazenamento)
├── styles/       # Estilos CSS
└── main.ts       # Ponto de entrada da aplicação
```

## 📝 Notas

- A qualidade da voz depende das vozes disponíveis no seu sistema operacional
- Alguns navegadores podem ter limitações no comprimento do texto para síntese de fala
- A velocidade de reprodução pode variar dependendo do navegador e do sistema operacional
- Os ícones são renderizados inline como SVG, eliminando dependências externas
- O rodapé fixo agora ocupa toda a largura em telas pequenas, garantindo botões acessíveis em dispositivos móveis

## 💖 Modal de Doação

- O QR Code para doações via PIX agora está disponível em [`assets/qr-code.svg`](assets/qr-code.svg) e só é requisitado quando o modal de doação é aberto pela primeira vez, utilizando um `<img>` com `loading="lazy"` para manter o HTML inicial leve.
- Um placeholder leve com dimensões fixas (`192x192`) evita mudanças de layout antes do carregamento da imagem.
- A abertura do modal foi validada em visualizações móveis (modo responsivo do Chrome DevTools) para garantir que o QR Code seja exibido corretamente em dispositivos touch.

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👤 Autor

Carlos Henrique Bernardes

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests para melhorias e correções de bugs.

## 💡 Dicas de Uso

- Use velocidades mais lentas (0.5x - 1.0x) para melhor compreensão
- Use velocidades mais rápidas (1.5x - 2.0x) para revisão rápida
- Salve textos frequentemente usados para acesso rápido
- Teste diferentes vozes do seu sistema para encontrar a que melhor se adequa

## 🐛 Solução de Problemas

### A voz não está funcionando
- Verifique se o JavaScript está habilitado no navegador
- Tente recarregar a página
- Certifique-se de que o navegador tem permissão para usar síntese de fala

### O botão Salvar está desabilitado
- O botão Salvar só fica habilitado após iniciar uma reprodução
- Verifique se há espaço disponível no armazenamento local do navegador

### Texto não é lido completamente
- Alguns navegadores têm limite de comprimento para síntese de fala
- Tente dividir o texto em partes menores

---

**Aproveite o Leitor de Texto! 🎉**
