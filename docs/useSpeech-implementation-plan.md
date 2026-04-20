# Plano de implementação: integração do `useSpeech` (react-text-to-speech)

## Objetivo
Integrar a API `useSpeech` do `react-text-to-speech` na aplicação **text-reader**, substituindo (ou encapsulando) o fluxo atual baseado em `window.speechSynthesis`, sem regressões de UX, acessibilidade e internacionalização.

Referência funcional: https://rtts.vercel.app/docs/usage/useSpeech

## Escopo funcional
- Controle de reprodução por hook (`start`, `pause`, `stop`) e estado (`speechStatus`, `isInQueue`).
- Compatibilidade com recursos centrais do app atual:
  - texto livre de entrada;
  - controle de velocidade;
  - persistência de preferências;
  - i18n existente;
  - comportamento seguro quando API de voz não estiver disponível.
- Cobertura de testes unitários para **todas** as funcionalidades que serão trocadas.
- Atualização da documentação técnica e de uso.

## Fora de escopo
- Reescrita de layout/identidade visual.
- Inclusão de bibliotecas auxiliares (ex.: markdown/highlighting avançado), salvo necessidade comprovada.
- Mudanças em analytics e pipelines CI fora do necessário para os testes novos.

## Premissa mandatória de qualidade (gate)
A implementação da biblioteca `react-text-to-speech` **só pode começar após** a cobertura unitária atingir **95% ou mais** nos módulos impactados pela troca da engine de fala.

### Gate de execução
- **Fase 1 (obrigatória):** ampliar testes unitários da implementação atual (`window.speechSynthesis`) até >= 95% de cobertura nos pontos que serão substituídos.
- **Fase 2 (liberada apenas após gate):** iniciar integração do `useSpeech` mantendo os mesmos contratos comportamentais validados na fase 1.

### Funcionalidades que precisam estar cobertas antes da troca
1. Inicialização de estado de reprodução.
2. Fluxos de `play`, `pause`, `stop`.
3. Controle e persistência de `rate`.
4. Sincronização de UI com estado interno.
5. Tratamento de indisponibilidade da API de voz.
6. Tratamento de erro sem quebra da interface.
7. Comportamento por idioma/localização relevante para síntese.

## Estratégia técnica

### 1) Camada de abstração de fala
Criar uma interface de engine para desacoplar a UI da implementação concreta:

- `SpeechEngine` (novo contrato):
  - `start(text: string): void`
  - `pause(): void`
  - `stop(): void`
  - `setRate(rate: number): void`
  - `getStatus(): SpeechStatus`
- `RttsSpeechEngine` (adapta `useSpeech`)
- `NativeSpeechEngine` (fallback opcional para manter compatibilidade)

> Benefício: facilita testes, rollback e evolução incremental.

### 2) Integração no app
- Adaptar `src/app/textReaderApp.ts` para usar o engine (via injeção simples ou factory).
- Manter os mesmos gatilhos de UI já existentes (botões e slider de velocidade), evitando quebra de comportamento.
- Mapear estados do `useSpeech` para o modelo interno:
  - `started` -> tocando
  - `paused` -> pausado
  - `stopped`/`queued` -> parado/fila

### 3) Tratamento de voz e idioma
- Priorizar idioma atual do i18n no setup do hook (`lang`) quando aplicável.
- Definir fallback explícito quando não houver voice compatível.
- Preservar configuração de `rate` já persistida no storage.

### 4) Observabilidade e erros
- Conectar `onError` para mensagens amigáveis ao usuário e log técnico.
- Garantir que interrupções (`stop`) limpem estado visual corretamente.

## Plano de testes unitários

### Arquivos candidatos
- `tests/text-reader-app-speech.test.ts` (novo)
- ajustes em `tests/setup.ts` para mocks de speech quando necessário
- ajustes no `jest.config.cjs` para gerar relatório de cobertura por arquivo e suportar gate

### Cenários mínimos
1. **Inicialização**: app sobe com estado “parado” e controles habilitados.
2. **Start**: ao acionar play, chama `start` com texto atual.
3. **Pause/Resume**: transições corretas de estado e rótulos de botão.
4. **Stop**: limpa estado de reprodução e não mantém fila indevida.
5. **Rate**: alteração do slider chama `setRate` e persiste valor.
6. **i18n/lang**: idioma da síntese acompanha idioma selecionado quando suportado.
7. **Erro no hook**: `onError` gera feedback de falha sem quebrar UI.
8. **Fallback**: sem suporte de speech, UI exibe aviso e evita chamadas inválidas.

### Critérios de aceite dos testes
- Cobrir fluxo feliz e erros principais.
- Não depender de áudio real no ambiente de teste.
- Mock determinístico dos eventos do hook.
- Evidenciar cobertura >= 95% nos arquivos impactados, com relatório versionável em CI.

### Métrica mínima para liberar implementação
- Cobertura unitária mínima de **95%** para os componentes/módulos impactados pela substituição de engine.
- Falha automática de pipeline se o limiar não for atingido.

## Plano de documentação

### Atualizações obrigatórias
1. **README.md**
   - seção “Arquitetura de síntese de voz” descrevendo `useSpeech` + fallback;
   - seção “Limitações e compatibilidade de browser”;
   - seção “Estratégia de migração orientada por cobertura (>=95%)”.
2. **README.pt-BR.md**
   - espelhamento das mudanças em português.
3. **Changelog/nota de release** (se o repositório adotar no momento da implementação)
   - impacto para usuário final;
   - eventuais mudanças de comportamento.

## Plano de execução (incremental)
1. Cobrir, com testes unitários, as funcionalidades atuais que serão trocadas.
2. Configurar e validar o gate de cobertura >= 95% para módulos impactados.
3. Criar abstração de engine + testes unitários da camada nova.
4. Integrar engine ao `textReaderApp` mantendo API interna estável.
5. Cobrir cenários de UI/state em testes unitários.
6. Validar regressões com suíte atual.
7. Atualizar READMEs e checklist de compatibilidade.

## Riscos e mitigação
- **Diferenças de comportamento entre navegadores**: mitigar com fallback e detecção explícita.
- **Mudança de semântica de estado (`speechStatus`)**: mitigar com adapter normalizando estados.
- **Fragilidade de testes por API Web Speech**: mitigar com mocks e contratos de engine.
- **Cobertura artificial sem assertividade real**: mitigar com revisão de cenários críticos por comportamento (não apenas linha).

## Definition of Done
- Cobertura unitária >= 95% nos módulos impactados antes da integração do `useSpeech`.
- Integração funcional do `useSpeech` sem regressões principais.
- Testes unitários novos passando em CI.
- Documentação atualizada (EN + PT-BR).
- Sem adição de dependências externas desnecessárias.
