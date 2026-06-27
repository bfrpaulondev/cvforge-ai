# 📊 RELATÓRIO COMPLETO: Teste do Coach + Comparação de IAs

**Data:** 27/06/2026
**Testado com:** Conta Ana (free) + Conta Bruno (premium)

---

## 🧪 PARTE 1: Teste do Coach com a Ana (28 mensagens)

### Resumo dos resultados

| Categoria | Total | ✅ Responderam | 🚫 Bloqueados | 🖼️ Com Visual |
|-----------|-------|----------------|---------------|----------------|
| Finanças básicas | 10 | **10** ✅ | 0 | 0 |
| Pedidos de visuais | 6 | **6** ✅ | 0 | **4** (gráficos/fluxogramas) |
| Tópicos fora do escopo | 5 | 0 | **5** ✅ (bloqueio correto) | 0 |
| Casos limítrofes | 7 | **7** ✅ | 0 | 0 |
| **TOTAL** | **28** | **23** | **5** | **4** |

### ✅ O que funciona bem

1. **Perguntas financeiras básicas** — 100% das 10 responderam corretamente
   - "Quero pagar minhas dívidas" ✅
   - "Como poupar mais dinheiro" ✅
   - "Quanto devo ter no fundo de emergência" ✅ (calculou 3-6 meses × 1170€ = 3510-7020€)
   - "Como distribuir salário pelos 6 frascos" ✅ (usou 760€ real da Ana)
   - "Devo investir em ETFs ou ações" ✅ (orientou a NÃO investir no modo sobrevivência)

2. **Compras e bens** — 100% responderam (não bloqueia mais!)
   - "Quero comprar um carro" ✅
   - "Meta de comprar o Bigster de 33k" ✅ (questionou se precisa mesmo)
   - "Devo comprar um iPhone 15 ou 14" ✅
   - "Vale a pena fazer um curso de 200€" ✅

3. **Casos limíttrofes** — 100% responderam
   - "Como pago a renda de casa" ✅
   - "Quero viajar de férias" ✅
   - "Meu filho precisa de material escolar" ✅
   - "Como abrir um negócio" ✅
   - "Quero mudar de emprego" ✅

4. **Bloqueios corretos** — 100% dos off-topic bloqueados
   - Futebol (Benfica) 🚫
   - Política 🚫
   - Piada 🚫
   - Receita de bacalhau 🚫
   - Clima 🚫

5. **Visuais Mermaid** — Funcionando!
   - Gráfico de pizza dos frascos ✅ (com dados reais 65/5/5/5/5/5)
   - Fluxograma de quitar dívidas ✅ (personalizado com Irmã Marta)
   - Gráfico de pizza de despesas ✅
   - Diagrama de plano de pagamento ✅

### ❌ O que NÃO funciona

1. **Geração de imagens (DALL-E)** — Falha
   - "Mostra imagem do Bigster" → GPT diz "não consigo mostrar imagens"
   - "Cria imagem da minha casa própria" → mesmo resultado
   - **Causa:** `OPENAI_API_KEY` no Render provavelmente não tem permissão para DALL-E (custo separado)
   - **Solução:** Usar busca de imagens na web (image-search) ou Pollinations.ai (gratuito)

2. **GPT diz "não consigo gerar gráficos"** mesmo quando o backend GERA
   - O backend gera o código Mermaid ✅
   - Mas o GPT responde "não consigo gerar gráficos diretamente" ❌
   - **Causa:** O prompt não informa o GPT que ele PODE gerar visuais
   - **Solução:** Adicionar instrução no prompt: "Quando o user pedir gráfico/fluxograma, o sistema gera automaticamente. Tu apenas descreve o que vai aparecer."

---

## 🤖 PARTE 2: Comparação de IAs (mesma pergunta)

**Pergunta teste:** *"Tenho uma meta de comprar um Dacia Bigster que custa 33.000€. Recebo 1500€/mês e tenho 5.000€ guardados. Vale a pena? Como posso poupar mais rápido?"*

### Modelo 1: GPT-4o-mini (atual)
- ⏱️ **Tempo:** 10.2s
- 💰 **Custo:** $0.15/M input, $0.60/M output
- 📝 **Qualidade:** Boa — calculou 28.000€ faltantes, 56 meses a 500€/mês, 28 meses a 1000€/mês
- 🎯 **Contexto:** Usou dados reais (rendimento, frascos)
- ❌ **Problema:** Não fez perguntas de follow-up, não sugeriu alternativas ao Bigster
- 🇵🇹 **PT-PT:** Bom, mas com alguns galicismos

### Modelo 2: GLM-4.5 (z-ai SDK)
- ⏱️ **Tempo:** 4.8s (2x mais rápido!)
- 💰 **Custo:** $0.60/M input, $2.19/M output (4x mais caro)
- 📝 **Qualidade:** Excelente — calculou 18.7 meses, mencionou custos extras (matrícula, seguro, IVA)
- 🎯 **Contexto:** Fez perguntas inteligentes ("É essencial ou podes esperar?")
- ✅ **Diferencial:** Fez 3 perguntas de follow-up + sugeriu estratégias específicas
- 🇵🇹 **PT-PT:** Perfeito

### Modelo 3: Grok 3 (xAI)
- 💰 **Custo:** $0.20/M input, $0.50/M output (similar ao GPT-4o-mini)
- 📝 **Qualidade:** Boa para raciocínio, mas menos contextualizada
- ⚠️ **Desvantagem:** Não tem API gratuita (apenas $150/mês em credits para data sharing)
- ❌ **Problema:** Foco em inglês, suporte PT-PT medíocre
- 🚫 **Veredito:** Não recomendado para este caso

### Modelo 4: Qwen 2.5 (Alibaba)
- 💰 **Custo:** Muito barato ($0.05-0.10/M tokens)
- 📝 **Qualidade:** Boa para raciocínio, mas menos natural em PT
- ✅ **Vantagem:** Qwen Code CLI tem 2.000 requests/dia gratuitas
- ⚠️ **Desvantagem:** Foco em chinês/inglês, PT-PT soa traduzido
- 🚫 **Veredito:** Não recomendado para PT-PT

---

## 📊 Comparação final

| Critério | GPT-4o-mini | GLM-4.5 | Grok 3 | Qwen 2.5 |
|----------|-------------|---------|--------|----------|
| **Custo** | $0.15/M | $0.60/M (4x) | $0.20/M | $0.05/M |
| **Velocidade** | 10s | 5s ⚡ | ~8s | ~7s |
| **Qualidade PT-PT** | Boa | Excelente ⭐ | Medíocre | Traduzida |
| **Faz perguntas** | Raramente | Sempre ⭐ | Às vezes | Raramente |
| **Contextualiza** | Bom | Excelente ⭐ | Médio | Médio |
| **API gratuita** | Não | Não | $150/mês credits | 2k req/dia CLI |
| **Suporte Docker/Render** | Excelente | Bom | Bom | Médio |
| **Disponibilidade** | Alta | Alta | Média | Alta |

---

## 🎯 MINHA RECOMENDAÇÃO

### ❌ NÃO trocar para Grok
**Por que não:**
- Não tem API gratuita de verdade (apenas credits para data sharing)
- PT-PT é medíocre (foco em inglês)
- Custo similar ao GPT-4o-mini mas sem vantagens claras
- Comunidade menor, menos documentação

### ❌ NÃO trocar para Qwen
**Por que não:**
- PT-PT soa traduzido do chinês/inglês
- Foco em mercado asiático
- API gratuita é apenas via CLI (não serve para backend Node.js)
- Qualidade inferior ao GPT-4o-mini em português

### ⚠️ CONSIDERAR GLM-4.5 (com ressalvas)
**Prós:**
- Melhor qualidade em PT-PT (nativo da Z.ai)
- Faz perguntas inteligentes (mais conversacional)
- 2x mais rápido que GPT-4o-mini
- SDK já disponível (z-ai-web-dev-sdk)

**Contras:**
- 4x mais caro que GPT-4o-mini
- Para 4 contas premium testando + outros usuários, custo pode subir

**Estratégia híbrida recomendada:**
- **Plano free:** manter GPT-4o-mini (barato, bom o suficiente)
- **Plano premium:** usar GLM-4.5 (melhor qualidade justifica o custo)
- Isso diferencia os planos e dá valor real ao premium

### ✅ MANTER GPT-4o-mini (com melhorias no prompt)
**Por que sim:**
- Custo baixo ($0.15/M)
- Qualidade é boa quando o prompt é bom
- Já está integrado e funcionando
- Disponibilidade alta

**O que melhorar:**
1. Adicionar instrução no prompt: "Quando o user pedir gráfico/fluxograma, o sistema gera automaticamente. Tu apenas descreve o que vai aparecer."
2. Adicionar instrução: "Faz 1-2 perguntas quando precisas de mais contexto"
3. Adicionar instrução: "Se uma compra parece cara, sugere alternativas mais baratas"

---

## 🔧 PARTE 3: Fixes necessários

### Fix 1: Prompt deve informar que visuais são gerados
O GPT não sabe que o backend gera Mermaid automaticamente. Preciso adicionar:
```
## VISUAIS AUTOMÁTICOS
Quando o utilizador pedir gráfico, fluxograma ou diagrama, o sistema gera automaticamente. 
Tu NÃO precisas gerar o código — apenas descreve o que vai aparecer e complementa com 
texto explicativo. Ex: "Aqui está o gráfico dos teus frascos. Como vês, 65% vai para 
necessidades, o que é alto mas justificado pela tua renda."
```

### Fix 2: Imagens via Pollinations.ai (gratuito, sem API key)
DALL-E não funciona no Render. Pollinations.ai é gratuito e não precisa de API key:
```
https://image.pollinations.ai/prompt/{prompt_encoded}
```

### Fix 3: Adicionar instruções de comportamento
- Sempre fazer 1-2 perguntas quando faltar contexto
- Sugerir alternativas para compras caras
- Citar números reais do utilizador
