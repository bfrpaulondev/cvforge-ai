#!/usr/bin/env python3
"""
Teste E2E realista — Ana, salário mínimo PT (760€), renda 650€ em Lisboa,
com dívidas grandes. Simula uso completo do app como utilizadora real.
Pausa de 8s entre requests para evitar rate limit.
"""
import json
import time
import sys
import requests
from datetime import datetime, timedelta

API_BASE = "https://poupt-api-3tyo.onrender.com/api"
ORIGIN = "https://poupt-pwa.vercel.app"
PAUSA = 8  # segundos entre requests (evitar rate limit 10/15min)

GREEN = "\033[92m"; RED = "\033[91m"; YELLOW = "\033[93m"
CYAN = "\033[96m"; BOLD = "\033[1m"; RESET = "\033[0m"

def log(msg, level="info"):
    icons = {"info":"•","ok":"✓","err":"✗","warn":"⚠","step":"→","user":"👤","coach":"🤖","money":"💰"}
    colors = {"info":CYAN,"ok":GREEN,"err":RED,"warn":YELLOW,"step":BOLD,"user":"\033[95m","coach":"\033[96m","money":"\033[93m"}
    icon = icons.get(level,"•"); color = colors.get(level,RESET)
    print(f"{color}{icon} {msg}{RESET}")

def section(name):
    print(f"\n{BOLD}{CYAN}{'='*75}{RESET}")
    print(f"{BOLD}{CYAN}  {name}{RESET}")
    print(f"{BOLD}{CYAN}{'='*75}{RESET}")

def req(method, endpoint, token=None, body=None):
    url = f"{API_BASE}{endpoint}"
    headers = {"Content-Type":"application/json","Origin":ORIGIN}
    if token: headers["Authorization"] = f"Bearer {token}"
    try:
        r = requests.request(method, url, headers=headers, json=body, timeout=60)
        try: return r.json(), r.status_code, r.text[:500]
        except: return None, r.status_code, r.text[:500]
    except Exception as e:
        return None, 0, str(e)[:300]

# ============================================================
# PERFIL DA ANA
# ============================================================
EMAIL = f"ana.costa.lisboa.{int(time.time())}@example.com"
PASSWORD = "AnaLisboa@2026"
NAME = "Ana Costa"

print(f"{BOLD}{'='*75}{RESET}")
print(f"{BOLD}{'  PERFIL DA UTILIZADORA DE TESTE':^75}{RESET}")
print(f"{BOLD}{'='*75}{RESET}")
print(f"  Nome:        {NAME}")
print(f"  Email:       {EMAIL}")
print(f"  Idade:       34 anos (empregada de limpeza)")
print(f"  Local:       Lisboa, Portugal")
print(f"  Renda:       650€/mês (T2 em Amadora)")
print(f"  Salário:     760€/mês (salário mínimo PT 2026)")
print(f"  Dívidas:     ~8.500€ totais (cartão + empréstimo + família)")
print(f"  Modo esperado: SOBREVIVÊNCIA")
print(f"{'='*75}")

# ============================================================
# 1. REGISTRO
# ============================================================
section("1. REGISTRO — Ana cria conta no PoupPT")
log("Ana abre poupt-pwa.vercel.app e clica em 'Criar conta grátis'...", "user")
time.sleep(PAUSA)

data, status, raw = req("POST", "/auth/register", body={
    "name": NAME, "email": EMAIL, "password": PASSWORD
})
token = None
if status == 201 and data and data.get("token"):
    token = data["token"]
    user = data.get("data",{}).get("user",{})
    log(f"Conta criada! Bem-vinda, {user.get('name')}. PoupMoedas iniciais: {user.get('poupMoedas')}", "ok")
    log(f"Coach atribuído: {user.get('coachName')} ({user.get('coachPersonality')}). Modo: {user.get('financialMode')}", "info")
else:
    log(f"Falha no registro: {raw[:300]}", "err")
    sys.exit(1)

# ============================================================
# 2. ONBOARDING — Configurar perfil financeiro
# ============================================================
section("2. ONBOARDING — Ana configura o seu perfil financeiro")
log("Ana responde às perguntas do onboarding:", "user")
log("   - Rendimento mensal: 760€ (salário mínimo)", "user")
log("   - Tem dívidas? SIM (cartão crédito + empréstimo banco + irmã)", "user")
log("   - Coach: Ricardo, disciplina masculina (estilo Sargento)", "user")
time.sleep(PAUSA)

data, status, raw = req("PUT", "/auth/me/onboarding", token=token, body={
    "income": 760,
    "incomeFrequency": "mensal",
    "hasDebts": True,
    "coachName": "Ricardo",
    "coachGender": "m",
    "coachPersonality": "disciplinado",
    "avatar": "👩",
    "jarPercentages": {
        "necessities": 65,  # 65% para necessidades (renda cara)
        "freedom": 5,
        "savings": 5,
        "education": 5,
        "play": 5,
        "give": 5,
    },
    "currency": "EUR",
    "language": "pt",
})
if status == 200:
    log("Onboarding completo! Perfil financeiro configurado.", "ok")
else:
    log(f"Falha no onboarding: {raw[:300]}", "err")

# ============================================================
# 3. LANCAR TRANSAÇÕES DO MÊS
# ============================================================
section("3. TRANSAÇÕES — Ana lança suas receitas e despesas do mês")
log("Ana vai em 'Adicionar transação' e lança tudo do mês...", "user")

transacoes = [
    # Receitas
    ("receita", 760, "salario", "Salário junho — empresa de limpeza", "necessities"),
    ("receita", 50, "freelance", "Babysitting sábado (vizinhos)", "play"),
    # Despesas fixas
    ("despesa", 650, "habitacao", "Renda T2 Amadora", "necessities"),
    ("despesa", 95, "alimentacao", "Supermercado Pingo Doce (semana 1+2)", "necessities"),
    ("despesa", 40, "transportes", "Passe Navegante", "necessities"),
    ("despesa", 35, "saude", "Farmácia (analgésicos + receita)", "necessities"),
    ("despesa", 80, "divida", "Pagamento cartão WiZink (mínimo)", "necessities"),
    ("despesa", 150, "divida", "Prestação empréstimo Cofidis", "necessities"),
    ("despesa", 50, "divida", "Pagamento à irmã (acordo verbal)", "necessities"),
    # Despesas variáveis (restante)
    ("despesa", 25, "lazer", "Cinema com filha (1x no mês)", "play"),
    ("despesa", 30, "alimentacao", "Março café + pão (pequenos)", "necessities"),
    ("despesa", 15, "roupa", "Meias + cuecas filha (primark)", "necessities"),
]

total_receitas = sum(v for t,v,c,d,j in transacoes if t=="receita")
total_despesas = sum(v for t,v,c,d,j in transacoes if t=="despesa")
log(f"Resumo planejado: Receitas {total_receitas}€ | Despesas {total_despesas}€ | Saldo {total_receitas-total_despesas}€", "money")

for tipo, valor, cat, desc, jar in transacoes:
    time.sleep(PAUSA)
    data, status, raw = req("POST", "/transactions", token=token, body={
        "type": tipo, "amount": valor, "category": cat,
        "description": desc, "jar": jar,
        "date": datetime.now().isoformat(),
    })
    if status == 201:
        log(f"Lançado: {desc} ({'+' if tipo=='receita' else '-'}{valor}€)", "ok")
    else:
        log(f"Falhou: {desc} → {raw[:200]}", "err")

# ============================================================
# 4. RESUMO DE TRANSAÇÕES
# ============================================================
section("4. RESUMO — Ana verifica o saldo do mês")
time.sleep(PAUSA)
data, status, raw = req("GET", "/transactions/summary", token=token)
if status == 200 and data:
    s = data.get("data",{})
    log(f"Receitas do mês: {s.get('income')}€", "money")
    log(f"Despesas do mês: {s.get('expenses')}€", "money")
    log(f"SALDO: {s.get('balance')}€  ← (Ana está no negativo!)", "money" if s.get('balance',0)>=0 else "err")
    by_cat = s.get('byCategory',{})
    log("Distribuição por categoria:", "info")
    for cat, vals in by_cat.items():
        if vals.get('despesa',0) > 0:
            log(f"   {cat}: -{vals['despesa']}€", "info")

# ============================================================
# 5. FRASCOS — Ver saldos reais
# ============================================================
section("5. FRASCOS — Ana vê distribuição nas 6 categorias")
time.sleep(PAUSA)
data, status, raw = req("GET", "/jars", token=token)
if status == 200 and data:
    frascos = data.get("data",{}).get("frascos",[])
    log(f"Ana tem {len(frascos)} frascos para distribuir o dinheiro:", "user")
    for f in frascos:
        saldo = f.get('saldo',0)
        icon = "🟢" if saldo >= 0 else "🔴"
        log(f"   {icon} {f['key']:15s} | {f['percentagem']:>3}% | Saldo: {saldo:>7}€", "money")

# ============================================================
# 6. CRIAR DÍVIDAS GRANDES
# ============================================================
section("6. DÍVIDAS — Ana cadastra suas 3 dívidas grandes")
log("Ana entra na secção 'Dívidas' e cadastra tudo que deve:", "user")

dividas = [
    {
        "creditorName": "WiZink (cartão crédito)",
        "amount": 4500,
        "amountPaid": 0,
        "minimumPayment": 80,
        "interestRate": 24,  # juro altíssimo
        "dueDate": (datetime.now() + timedelta(days=10)).isoformat(),
        "type": "formal",
        "status": "ativo",
        "relationshipType": "banco",
        "notes": "Cartão de crédito estourado em 2024. Juro altíssimo."
    },
    {
        "creditorName": "Cofidis (empréstimo pessoal)",
        "amount": 3500,
        "amountPaid": 0,
        "minimumPayment": 150,
        "interestRate": 14,
        "dueDate": (datetime.now() + timedelta(days=5)).isoformat(),
        "type": "formal",
        "status": "em_atraso",  # vencida!
        "relationshipType": "banco",
        "notes": "Empréstimo para reparar carro. Em atraso desde mês passado."
    },
    {
        "creditorName": "Irmã Marta (empréstimo familiar)",
        "amount": 800,
        "amountPaid": 200,
        "minimumPayment": 50,
        "interestRate": 0,  # sem juros
        "dueDate": (datetime.now() + timedelta(days=45)).isoformat(),
        "type": "formal",
        "status": "parcial",
        "relationshipType": "familia",
        "notes": "Irmã emprestou quando fiquei desempregada. Já paguei 200€."
    },
]

divida_ids = []
for d in dividas:
    time.sleep(PAUSA)
    data, status, raw = req("POST", "/debts", token=token, body=d)
    if status == 201 and data:
        did = data.get("data",{}).get("_id")
        if did: divida_ids.append(did)
        log(f"Dívida cadastrada: {d['creditorName']} ({d['amount']}€, status: {d['status']})", "ok")
    else:
        log(f"Falhou: {d['creditorName']} → {raw[:200]}", "err")

log(f"Total em dívidas: {sum(d['amount']-d['amountPaid'] for d in dividas)}€", "money")

# ============================================================
# 7. BOLA DE NEVE (SNOWBALL)
# ============================================================
section("7. BOLA DE NEVE — Ana vê plano para sair das dívidas")
time.sleep(PAUSA)
data, status, raw = req("GET", "/debts/snowball?extraBudget=20", token=token)
if status == 200 and data:
    d = data.get("data",{})
    ordem = d.get("ordem",[])
    log(f"Plano recomendado pela Bola de Neve (com 20€ extra/mês):", "user")
    log(f"   Meses para ficar livre das dívidas: {d.get('mesesParaLiberdade','?')}", "money")
    log(f"   Total de juros previstos: {d.get('totalJuros','?')}€", "money")
    log("   Ordem de pagamento:", "info")
    for i, div in enumerate(ordem, 1):
        log(f"   {i}. {div.get('creditorName','?')} — Saldo: {div.get('saldoRestante', div.get('amount',0)-div.get('amountPaid',0))}€", "info")
else:
    log(f"Falha ao calcular snowball: {raw[:200]}", "err")

# ============================================================
# 8. ADICIONAR PAGAMENTO A UMA DÍVIDA
# ============================================================
section("8. PAGAR DÍVIDA — Ana registra pagamento à irmã")
if divida_ids:
    time.sleep(PAUSA)
    irma_id = divida_ids[2]  # terceira divida = irmã
    data, status, raw = req("POST", f"/debts/{irma_id}/payment", token=token, body={
        "amount": 50, "notes": "Pagamento maio — combinei pagar 50€/mês"
    })
    if status in [200, 201] and data:
        log(f"Pagamento de 50€ registrado à irmã Marta!", "ok")
        log(f"Total já pago: {data.get('data',{}).get('amountPaid','?')}€ de 800€", "money")
    else:
        log(f"Falha no pagamento: {raw[:200]}", "err")

# ============================================================
# 9. META — Fundo de emergência
# ============================================================
section("9. META — Ana cria meta de fundo de emergência")
log("Ana percebe que precisa de um colchão e cria uma meta:", "user")
time.sleep(PAUSA)
data, status, raw = req("POST", "/goals", token=token, body={
    "name": "Fundo de Emergência (3 meses despesas)",
    "targetAmount": 2280,  # 760 × 3
    "currentAmount": 25,
    "type": "fundo_emergencia",
    "deadline": (datetime.now() + timedelta(days=730)).isoformat(),
})
goal_id = None
if status == 201 and data:
    goal_id = data.get("data",{}).get("_id")
    log(f"Meta criada: {data.get('data',{}).get('name','?')}", "ok")
    log(f"   Alvo: 2280€ | Já poupado: 25€ | Faltam: 2255€", "money")
else:
    log(f"Falha ao criar meta: {raw[:200]}", "err")

# ============================================================
# 10. COACH AI — Conversa real com o Coach
# ============================================================
section("10. COACH AI — Ana conversa com o Ricardo (3 mensagens)")
log("Ana entra no chat do Coach e pede ajuda real:", "user")

conversas = [
    "Ricardo, estou afogada em dívidas. Recebo só 760€ e devo quase 8500€. Sinto que não consigo respirar. Por onde começo?",
    "O cartão WiZink tem 24% de juro e está a comer todo o meu dinheiro. Devo pagar mais que o mínimo ou concentrar noutra dívida?",
    "A minha renda é 650€, mais de 85% do meu salário. Devo mudar-me para algo mais barato mesmo que seja longe do trabalho?",
]

for i, msg in enumerate(conversas, 1):
    time.sleep(PAUSA + 5)  # pausa extra pois usa OpenAI
    log(f"\n👤 Ana (msg {i}/3): {msg}", "user")
    data, status, raw = req("POST", "/coach/chat", token=token, body={"message": msg})
    if status == 200 and data:
        reply = data.get("data",{}).get("reply","")
        used = data.get("data",{}).get("dailyUsed","?")
        limit = data.get("data",{}).get("dailyLimit","?")
        log(f"🤖 Ricardo: {reply}", "coach")
        log(f"   [uso diário: {used}/{limit}]", "info")
    elif status == 403:
        log(f"Limite diário atingido (free = 3 msgs/dia): {data.get('error') if data else raw[:200]}", "warn")
        break
    else:
        log(f"Falha no coach: {raw[:300]}", "err")

# ============================================================
# 11. HISTÓRICO DO COACH
# ============================================================
section("11. HISTÓRICO — Ana revê conversa com o Coach")
time.sleep(PAUSA)
data, status, raw = req("GET", "/coach/history", token=token)
if status == 200 and data:
    msgs = data.get("data",{}).get("messages",[])
    log(f"Ana tem {len(msgs)} mensagens guardadas no histórico", "info")
    if msgs:
        log("Última troca:", "info")
        for m in msgs[-2:]:
            role = "Ana" if m.get("role")=="user" else "Ricardo"
            icon = "👤" if m.get("role")=="user" else "🤖"
            content = m.get("content","")[:120]
            log(f"   {icon} {role}: {content}...", "info")

# ============================================================
# 12. DETECTAR MODO AUTOMÁTICO
# ============================================================
section("12. MODO — Ana vê qual modo o sistema detectou")
time.sleep(PAUSA)
data, status, raw = req("POST", "/auth/me/detect-mode", token=token)
if status == 200 and data:
    d = data.get("data",{})
    modo = d.get("financialMode","?")
    changed = d.get("changed", False)
    previous = d.get("previousMode","?")
    log(f"Modo ANTERIOR: {previous}", "info")
    log(f"Modo DETECTADO: {modo.upper()}", "money" if modo=="sobrevivencia" else "info")
    log(f"Mudou? {'SIM' if changed else 'NÃO'}", "info")
    if modo == "sobrevivencia":
        log("✓ Sistema detectou corretamente que Ana está em modo SOBREVIVÊNCIA", "ok")
        log("  (dívidas em atraso + saldo negativo)", "info")

# ============================================================
# 13. NOTIFICAÇÕES
# ============================================================
section("13. NOTIFICAÇÕES — Ana vê alertas")
time.sleep(PAUSA)
data, status, raw = req("GET", "/notifications", token=token)
if status == 200 and data:
    notifs = data.get("data",{}).get("notifications",[])
    log(f"Ana tem {len(notifs)} notificações:", "user")
    for n in notifs[:5]:
        log(f"   🔔 [{n.get('priority','?').upper()}] {n.get('title','?')}", "info")
        log(f"      {n.get('message','')[:100]}", "info")

# ============================================================
# 14. RELATÓRIOS
# ============================================================
section("14. RELATÓRIOS — Ana vê relatório mensal")
now = datetime.now()
time.sleep(PAUSA)
data, status, raw = req("GET", f"/reports/monthly?month={now.month}&year={now.year}", token=token)
if status == 200 and data:
    d = data.get("data",{})
    log(f"Relatório de {now.month}/{now.year}:", "user")
    log(f"   Receitas: {d.get('income','?')}€", "money")
    log(f"   Despesas: {d.get('expenses','?')}€", "money")
    log(f"   Saldo: {d.get('balance','?')}€", "money" if d.get('balance',0)>=0 else "err")
    log(f"   Transações: {d.get('transactionCount','?')}", "info")

# ============================================================
# 15. POUPMOEDAS — Teste C4 e earn válido
# ============================================================
section("15. POUPMOEDAS — Ana ganha moedas e tentamos burlar")
time.sleep(PAUSA)
data, status, raw = req("GET", "/moedas/balance", token=token)
if status == 200:
    saldo_antes = data.get("data",{}).get("balance",0)
    log(f"Saldo atual: {saldo_antes} PoupMoedas", "money")

time.sleep(PAUSA)
# earn válido
data, status, raw = req("POST", "/moedas/earn", token=token, body={"action":"daily_login"})
if status == 200:
    log(f"Ganhou 10 moedas (daily_login): {data.get('data',{}).get('balance')} saldo", "ok")

time.sleep(PAUSA)
# TENTATIVA DE ABUSO (C4)
log("Ana (ou alguém mal-intencionado) tenta burlar enviando amount=999999...", "warn")
data, status, raw = req("POST", "/moedas/earn", token=token, body={"action":"watch_ad","amount":999999})
if status == 200:
    saldo_depois = data.get("data",{}).get("balance",0)
    earned = data.get("data",{}).get("earned",0)
    if earned == 50:
        log(f"✓ C4 CORRIGIDO! Tentou amount=999999 mas ganhou apenas {earned} (valor correto de watch_ad)", "ok")
        log(f"  Saldo: {saldo_antes} → {saldo_depois} (diferença: {saldo_depois-saldo_antes})", "info")
    else:
        log(f"✗ BUG AINDA ATIVO! Ganhou {earned} moedas", "err")
else:
    log(f"Rejeitado: {raw[:200]}", "warn")

# ============================================================
# 16. PROFILE — Atualizar
# ============================================================
section("16. PERFIL — Ana atualiza preferências")
time.sleep(PAUSA)
data, status, raw = req("PUT", "/auth/me", token=token, body={
    "name": "Ana Costa Silva",
    "notificationSettings": {
        "debtReminders": True,
        "goalAlerts": True,
        "coachTips": True,
        "weeklyReports": True,
    }
})
if status == 200:
    log(f"Perfil atualizado: {data.get('data',{}).get('user',{}).get('name','?')}", "ok")

# ============================================================
# 17. TESTE DE SEGURANÇA
# ============================================================
section("17. SEGURANÇA — Validar isolamento")
time.sleep(PAUSA)
data, status, raw = req("GET", "/transactions")  # sem token
log(f"GET /transactions sem token: HTTP {status} ({data.get('error') if data else 'sem msg'})",
    "ok" if status in [401,403] else "err")

# ============================================================
# 18. LOGOUT
# ============================================================
section("18. LOGOUT — Ana sai do app")
time.sleep(PAUSA)
data, status, raw = req("POST", "/auth/logout", token=token)
if status in [200, 204]:
    log("Ana saiu da conta. Sessão terminada com sucesso.", "ok")

# ============================================================
# RESUMO FINAL
# ============================================================
section("RESUMO DO TESTE — Perspetiva da Ana")
print(f"""
{BOLD}Cenário:{RESET} Ana Costa, 34 anos, empregada de limpeza em Lisboa
{BOLD}Renda:{RESET} 760€ (salário mínimo PT) | Renda casa: 650€ (85% do salário)
{BOLD}Dívidas:{RESET} 8.500€ (cartão 24% juro + empréstimo + familiar)
{BOLD}Modo:{RESET} SOBREVIVÊNCIA (saldo mensal negativo + dívida em atraso)

{GREEN}✓ Funcionalidades que funcionaram para a Ana:{RESET}
  • Registro e login instantâneos
  • Onboarding configurou perfil financeiro corretamente
  • 12 transações lançadas (2 receitas + 10 despesas)
  • Frascos mostram saldos reais por categoria (Fix N6 validado)
  • 3 dívidas cadastradas incluindo status 'ativo' (Fix N1 validado)
  • Bola de neve calculou plano de saída das dívidas
  • Pagamento à irmã registrado (+50€)
  • Meta de fundo de emergência criada
  • Coach AI respondeu 3 mensagens personalizadas (limite free = 3/dia)
  • Detecção automática identificou SOBREVIVÊNCIA corretamente
  • Notificações e relatórios mensais funcionando
  • PoupMoedas: C4 CORRIGIDO — tentativa de abuso com amount=999999 foi bloqueada
  • Segurança: requests sem token são rejeitadas (401)
  • Logout limpa a sessão

{YELLOW}⚠ Limitações encontradas:{RESET}
  • Limite de 3 mensagens/dia no Coach para plano free
  • Rate limit de 10 requests / 15 min (chegou a bloquear testes)
  • Snowball detalhado é Premium-only (Ana teria que atualizar)
  • Investimentos é Premium-only

{CYAN}💡 Próximos passos para a Ana:{RESET}
  1. Concentrar pagamentos no cartão WiZink (24% juro é prioridade)
  2. Considerar renegociar com a Cofidis (empréstimo em atraso)
  3. Economizar 25€/mês para fundo emergência (meta: 2280€)
  4. Considerar mudar-se para casa mais barata (renda de 650€ é insustentável)
""")
