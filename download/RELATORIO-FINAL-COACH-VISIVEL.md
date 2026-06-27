# 🎯 BUG CRÍTICO CORRIGIDO — Coach Chat Invisível

**Data:** 27/06/2026
**Commit:** `1f92450` em `poupt-pwa`
**Bug:** Mensagens, input e botão enviar do chat Coach não apareciam na tela

---

## 🐛 O Bug

**Sintoma reportado pelo utilizador:**
> "Não dá pra ver as conversas e nem as mensagens... o utilizador não vê as mensagens não vê onde digita mensagens e nem botão enviar"

**Diagnóstico técnico:**
As mensagens estavam presentes no DOM (confirmado via `document.querySelector('main').innerText` retornando 9.232 chars), mas **não eram visíveis na tela** porque o container principal do Coach tinha `height: 0` (zero pixels).

---

## 🔍 Causa Raiz

O `Coach.jsx` usa no container principal:
```jsx
<div style={{
  position: 'fixed',
  inset: 0,
  // ...
}}>
```

Este `position: fixed; inset: 0` deveria fazer o container cobrir toda a tela (viewport). **Mas** o Coach estava sendo renderizado dentro da estrutura normal do app:

```
App.jsx
└── .app-shell
    └── .app-main
        └── .app-content
            └── .app-page-stage   ← TEM `contain: layout paint`
                └── motion.div
                    └── Coach.jsx (position: fixed)
```

O CSS `.app-page-stage` tem:
```css
.app-page-stage {
  contain: layout paint;  /* ← CRIA NOVO CONTAINING BLOCK */
}
```

A propriedade `contain: layout paint` cria um **novo containing block** para elementos `position: fixed` dentro dele. Isso faz com que o `fixed` seja relativo ao `.app-page-stage` (que tem altura variável) em vez de ser relativo ao viewport.

**Resultado:** O container do Coach ficava com `height: 0` porque o `.app-page-stage` não tinha altura definida — apenas `width: 100%`. Todas as mensagens, input e botão enviar ficavam invisíveis.

---

## ✅ A Correção

Adicionei `'coach'` à lista de `fullscreenScreens` no `App.jsx`:

**Antes:**
```js
const fullscreenScreens = ['landing', 'login', 'register', 'onboarding'];
```

**Depois:**
```js
const fullscreenScreens = ['landing', 'login', 'register', 'onboarding', 'coach'];
```

Com isso, o Coach agora é renderizado no `.app-fullscreen` (sem `contain`), onde o `position: fixed; inset: 0` funciona corretamente relativo ao viewport.

**Estrutura nova:**
```
App.jsx
└── .app-fullscreen   ← SEM `contain`
    └── Coach.jsx (position: fixed → cobre viewport inteiro ✅)
```

---

## 🧪 Validação em Produção

### Antes do fix (screenshot 46909 bytes = página vazia):
- Container do Coach: `width: 1016, height: 0` ❌
- Mensagens: no DOM mas invisíveis
- Input: no DOM mas invisível
- Botão Enviar: no DOM mas invisível

### Depois do fix (screenshot 80-87KB = conteúdo visível):
- Container do Coach: `width: 1280, height: 577` ✅
- Header: `y=0, w=1280, h=79.5` ✅
- Main (mensagens): `y=79.5, w=1280, h=392.5` ✅ (9.328 chars visíveis)
- Footer (input + botão): `y=472, w=1280, h=105` ✅
- Input existe e é visível: `true` ✅

### Teste de envio de mensagem (após fix):
1. ✅ Ana preencheu input com "Ricardo, você está visível agora?"
2. ✅ Pressionou Enter
3. ✅ POST `/api/coach/chat` retornou HTTP 200
4. ✅ Mensagem da Ana apareceu no chat (18:36)
5. ✅ Resposta do Ricardo apareceu: "Ana Costa, estou aqui e visível..."
6. ✅ Contador atualizou: "1/15 mensagens/dia (gratuito)"

---

## 📸 Screenshots de Validação

Todos em `/home/z/my-project/download/screenshots/`:

| Screenshot | Tamanho | Estado |
|------------|---------|--------|
| `FIX_01_coach_after_fix.png` | 46KB | Antes do deploy completar (vazio) |
| `FIX_02_coach_v2.png` | 80KB | **Coach visível com mensagens** ✅ |
| `FIX_03_coach_visible.png` | 80KB | **Mensagens visíveis** ✅ |
| `FIX_04_messages_visible.png` | 80KB | **Scroll para ver histórico** ✅ |
| `FIX_05_message_typed.png` | 80KB | Input preenchido |
| `FIX_06_message_sent.png` | 80KB | Mensagem enviada |
| `FIX_07_message_typed.png` | 84KB | Nova mensagem digitada |
| `FIX_08_response_received.png` | 87KB | **Resposta do Ricardo recebida** ✅ |

**Comparação de tamanhos:**
- Antes do fix: 46909 bytes (página vazia)
- Depois do fix: 80-87KB (conteúdo visível)

---

## 🎉 Conclusão

O bug estava **escondendo TODO o chat do Coach** — mensagens, input e botão enviar — em todas as contas. Não era um bug de dados ou backend, mas sim de **CSS layout**.

A correção foi de **1 linha** no `App.jsx` (adicionar `'coach'` à lista de `fullscreenScreens`), mas o diagnóstico exigiu:
1. Identificar que as mensagens estavam no DOM mas não visíveis
2. Descobrir que o container tinha `height: 0`
3. Identificar que `position: fixed` não estava relativo ao viewport
4. Rastrear a causa até `contain: layout paint` no `.app-page-stage`

**Agora o chat do Coach funciona 100% em produção** — mensagens visíveis, input digitável, botão enviar funcional, respostas do Ricardo em tempo real, e contador dinâmico de mensagens/dia.
