#!/usr/bin/env python3
"""
Teste E2E pesado: Simula 12 meses de uso da Ana.
Limpa todos os dados antes, depois simula evolução mensal completa.
"""
import requests
import time
import json
from datetime import datetime, timedelta
import random

API_BASE = "https://poupt-api-3tyo.onrender.com/api"
ORIGIN = "https://poupt-pwa.vercel.app"

GREEN = "\033[92m"; RED = "\033[91m"; YELLOW = "\033[93m"
CYAN = "\033[96m"; BOLD = "\033[1m"; MAGENTA = "\033[95m"; RESET = "\033[0m"

# Credenciais da Ana
EMAIL = "ana.costa.lisboa.1782575998@example.com"
PASSWORD = "AnaLisboa@2026"

def log(msg, level="info"):
    icons = {"info":"•","ok":"✓","err":"✗","warn":"⚠","step":"→","month":"📅","money":"💰","coach":"🤖","goal":"🎯","debt":"💳","invest":"📈","notif":"🔔"}
    colors = {"info":CYAN,"ok":GREEN,"err":RED,"warn":YELLOW,"step":BOLD,"month":MAGENTA,"money":YELLOW,"coach":"\033[96m","goal":"\033[92m","debt":"\033[91m","invest":"\033[95m","notif":"\033[93m"}
    icon = icons.get(level,"•")
    color = colors.get(level,RESET)
    print(f"{color}{icon} {msg}{RESET}")

def section(title):
    print(f"\n{BOLD}{MAGENTA}{'='*75}{RESET}")
    print(f"{BOLD}{MAGENTA}  {title}{RESET}")
    print(f"{BOLD}{MAGENTA}{'='*75}{RESET}")

def req(method, endpoint, token=None, body=None):
    url = f"{API_BASE}{endpoint}"
    headers = {"Content-Type":"application/json","Origin":ORIGIN}
    if token: headers["Authorization"] = f"Bearer {token}"
    try:
        r = requests.request(method, url, headers=headers, json=body, timeout=60)
        try: return r.json(), r.status_code
        except: return None, r.status_code
    except Exception as e:
        return {"error": str(e)}, 0

# Histórico completo
historico = {
    "user": EMAIL,
    "test_run": datetime.now().isoformat(),
    "limpeza": {},
    "meses": [],
    "resumo_final": {}
}

# ============================================================
# 1. LOGIN
# ============================================================
section("1. LOGIN COMO ANA")
data, status = req("POST", "/auth/login", body={"email": EMAIL, "password": PASSWORD})
if not data or not data.get("token"):
    log(f"Login falhou: {data}", "err")
    exit(1)
token = data["token"]
user = data.get("data",{}).get("user",{})
log(f"Login OK: {user.get('name')} | Plano: {user.get('plan')} | PoupMoedas: {user.get('poupMoedas')}", "ok")

# ============================================================
# 2. LIMPAR TODOS OS DADOS DA ANA
# ============================================================
section("2. LIMPAR TODOS OS DADOS DA ANA")

# 2.1 Listar e deletar todas as transações
log("Limpando transações...", "step")
data, _ = req("GET", "/transactions", token=token)
txs = data.get("data",{}).get("transactions",[]) if data else []
for tx in txs:
    req("DELETE", f"/transactions/{tx['_id']}", token=token)
log(f"  {len(txs)} transações deletadas", "ok")
historico["limpeza"]["transacoes"] = len(txs)

# 2.2 Listar e deletar todas as dívidas
log("Limpando dívidas...", "step")
data, _ = req("GET", "/debts", token=token)
debts = data.get("data",{}).get("debts",[]) if data else []
for d in debts:
    req("DELETE", f"/debts/{d['_id']}", token=token)
log(f"  {len(debts)} dívidas deletadas", "ok")
historico["limpeza"]["dividas"] = len(debts)

# 2.3 Listar e deletar todas as metas
log("Limpando metas...", "step")
data, _ = req("GET", "/goals", token=token)
goals = data.get("data",{}).get("goals",[]) if data else []
for g in goals:
    req("DELETE", f"/goals/{g['_id']}", token=token)
log(f"  {len(goals)} metas deletadas", "ok")
historico["limpeza"]["metas"] = len(goals)

# 2.4 Limpar histórico do Coach
log("Limpando histórico do Coach...", "step")
data, _ = req("DELETE", "/coach/history", token=token)
log(f"  Histórico do coach limpo", "ok")
historico["limpeza"]["coach_history"] = "limpo"

# 2.5 Resetar configurações da Ana
log("Resetando perfil para modo sobrevivência...", "step")
req("PUT", "/auth/me", token=token, body={
    "income": 760,
    "financialMode": "sobrevivencia",
    "jarPercentages": {
        "necessities": 65, "freedom": 5, "savings": 5,
        "education": 5, "play": 5, "give": 5
    }
})
log("  Perfil resetado: income=760, modo=sobrevivencia", "ok")

time.sleep(3)

# ============================================================
# 3. SIMULAÇÃO DE 12 MESES
# ============================================================
section("3. SIMULAÇÃO DE 12 MESES DE USO")

# Configuração da evolução da Ana
# Mês 1-3: Sobrevivência (760€ salário, dívidas grandes)
# Mês 4-6: Recuperação (760€ + freelance, pagando dívidas)
# Mês 7-9: Estabilidade (850€ salário aumento, fundo emergência)
# Mês 10-12: Crescimento (950€ salário, começando a investir)

MESES_CONFIG = [
    # Mês 1: Início da crise
    {
        "mes": 1, "modo": "sobrevivencia", "salario": 760,
        "renda_extra": 0, "despesas_base": 850,
        "divida_pago": 80,  # só mínimo
        "poupanca": 0,
        "coach_perguntas": [
            "Estou afogada em dívidas. Por onde começo?",
            "Como renegociar minha dívida com o WiZink?",
        ],
        "visual": "Faz fluxograma de como quitar minhas dívidas",
    },
    # Mês 2: Ainda em crise
    {
        "mes": 2, "modo": "sobrevivencia", "salario": 760,
        "renda_extra": 50,  # babysitting
        "despesas_base": 820,
        "divida_pago": 150,
        "poupanca": 0,
        "coach_perguntas": [
            "Consigo poupar algo mesmo com dívidas?",
            "Vale a pena fazer horas extra?",
        ],
        "visual": "Gera gráfico dos meus frascos",
    },
    # Mês 3: Começa a ver luz
    {
        "mes": 3, "modo": "sobrevivencia", "salario": 760,
        "renda_extra": 80,
        "despesas_base": 800,
        "divida_pago": 200,
        "poupanca": 25,
        "coach_perguntas": [
            "Já paguei alguma dívida. Como manter o momentum?",
        ],
        "visual": "Mostra-me uma imagem de estabilidade financeira",
    },
    # Mês 4: Modo recuperação
    {
        "mes": 4, "modo": "recuperacao", "salario": 760,
        "renda_extra": 100,
        "despesas_base": 780,
        "divida_pago": 250,
        "poupanca": 50,
        "coach_perguntas": [
            "Mudei para modo recuperação! O que muda agora?",
            "Como usar a bola de neve?",
        ],
        "visual": "Faz fluxograma da estratégia snowball",
    },
    # Mês 5: Pagando mais dívidas
    {
        "mes": 5, "modo": "recuperacao", "salario": 760,
        "renda_extra": 120,
        "despesas_base": 770,
        "divida_pago": 280,
        "poupanca": 75,
        "coach_perguntas": [
            "Quito a dívida menor primeiro ou a de maior juro?",
        ],
        "visual": "Gera gráfico de pizza das minhas despesas",
    },
    # Mês 6: Quase estabilidade
    {
        "mes": 6, "modo": "recuperacao", "salario": 760,
        "renda_extra": 100,
        "despesas_base": 750,
        "divida_pago": 300,
        "poupanca": 100,
        "coach_perguntas": [
            "Estou a poupar 100€! Como criar fundo de emergência?",
        ],
        "visual": None,
    },
    # Mês 7: Aumento de salário! Modo estabilidade
    {
        "mes": 7, "modo": "estabilidade", "salario": 850,  # aumento!
        "renda_extra": 100,
        "despesas_base": 750,
        "divida_pago": 200,  # dívidas menores agora
        "poupanca": 200,
        "coach_perguntas": [
            "Tive aumento para 850€! Como ajustar os frascos?",
            "Quanto devo ter no fundo de emergência?",
        ],
        "visual": "Gera gráfico dos meus frascos",
    },
    # Mês 8: Fundo emergência crescendo
    {
        "mes": 8, "modo": "estabilidade", "salario": 850,
        "renda_extra": 80,
        "despesas_base": 740,
        "divida_pago": 150,
        "poupanca": 250,
        "coach_perguntas": [
            "Como investir o fundo de emergência?",
        ],
        "visual": None,
    },
    # Mês 9: Quase sem dívidas
    {
        "mes": 9, "modo": "estabilidade", "salario": 850,
        "renda_extra": 120,
        "despesas_base": 730,
        "divida_pago": 100,
        "poupanca": 300,
        "coach_perguntas": [
            "Estou quase sem dívidas! O que vem a seguir?",
        ],
        "visual": "Faz fluxograma do meu progresso financeiro",
    },
    # Mês 10: Modo crescimento! Começa a investir
    {
        "mes": 10, "modo": "crescimento", "salario": 950,  # novo aumento
        "renda_extra": 150,
        "despesas_base": 750,
        "divida_pago": 50,
        "poupanca": 350,
        "investimento": 200,
        "coach_perguntas": [
            "Mudei para modo crescimento! Como começar a investir?",
            "ETFs ou cripto? O que recomendas?",
        ],
        "visual": "Gera gráfico de pizza da distribuição ideal",
    },
    # Mês 11: Investindo
    {
        "mes": 11, "modo": "crescimento", "salario": 950,
        "renda_extra": 100,
        "despesas_base": 740,
        "divida_pago": 0,  # sem dívidas!
        "poupanca": 300,
        "investimento": 350,
        "coach_perguntas": [
            "Já invisto 350€! Como diversificar?",
        ],
        "visual": None,
    },
    # Mês 12: Prosperidade!
    {
        "mes": 12, "modo": "prosperidade", "salario": 950,
        "renda_extra": 200,
        "despesas_base": 730,
        "divida_pago": 0,
        "poupanca": 250,
        "investimento": 450,
        "coach_perguntas": [
            "Cheguei ao modo prosperidade! Como otimizar fiscalmente?",
            "Faz um resumo da minha evolução este ano",
        ],
        "visual": "Gera gráfico da minha evolução financeira",
    },
]

# Criar dívidas iniciais (mês 1)
section("3.0 CRIAR DÍVIDAS INICIAIS (Mês 1)")
dividas_iniciais = [
    {"creditorName":"WiZink (cartão crédito)","amount":4500,"minimumPayment":80,"interestRate":24,"type":"formal","status":"ativo","notes":"Cartão crédito estourado"},
    {"creditorName":"Cofidis (empréstimo)","amount":3500,"minimumPayment":150,"interestRate":14,"type":"formal","status":"ativo","notes":"Empréstimo carro"},
    {"creditorName":"Irmã Marta","amount":800,"minimumPayment":50,"interestRate":0,"type":"formal","status":"parcial","notes":"Empréstimo familiar"},
]
divida_ids = []
for d in dividas_iniciais:
    data, _ = req("POST", "/debts", token=token, body=d)
    if data and data.get("success"):
        did = data.get("data",{}).get("_id") or data.get("data",{}).get("debt",{}).get("_id")
        if did: divida_ids.append(did)
        log(f"  Dívida criada: {d['creditorName']} ({d['amount']}€)", "debt")
    time.sleep(2)

# Criar meta inicial: fundo emergência
section("3.1 CRIAR META INICIAL")
data, _ = req("POST", "/goals", token=token, body={
    "name":"Fundo de Emergência","targetAmount":3000,"currentAmount":0,"type":"fundo_emergencia"
})
if data and data.get("success"):
    log("  Meta criada: Fundo de Emergência (3000€)", "goal")
goal_fundo_id = data.get("data",{}).get("_id") if data else None
time.sleep(2)

# ============================================================
# SIMULAR CADA MÊS
# ============================================================
for config in MESES_CONFIG:
    mes = config["mes"]
    section(f"MÊS {mes} — Modo: {config['modo'].upper()}")

    mes_data = {
        "mes": mes,
        "modo": config["modo"],
        "salario": config["salario"],
        "renda_extra": config["renda_extra"],
        "transacoes": [],
        "dividas_pagas": 0,
        "poupanca": config["poupanca"],
        "investimentos": 0,
        "coach_msgs": [],
        "visual_gerado": None,
        "notificacoes": 0,
        "relatorio": None,
    }

    # Data base: mês atual - (12 - mes) meses
    data_base = datetime.now() - timedelta(days=(12-mes)*30)

    # 1. Atualizar modo financeiro e salário
    log(f"Atualizando modo para {config['modo']} e salário {config['salario']}€", "step")
    req("PUT", "/auth/me", token=token, body={
        "income": config["salario"],
        "financialMode": config["modo"],
    })
    time.sleep(2)

    # 2. Lançar receitas
    log(f"Receitas: salário {config['salario']}€ + extra {config['renda_extra']}€", "money")
    # Salário
    data, _ = req("POST", "/transactions", token=token, body={
        "type":"receita","amount":config["salario"],"category":"salario",
        "description":f"Salário mês {mes}","jar":"necessities",
        "date": data_base.isoformat()
    })
    if data and data.get("success"):
        mes_data["transacoes"].append({"type":"receita","amount":config["salario"],"desc":f"Salário"})
    time.sleep(2)

    # Renda extra
    if config["renda_extra"] > 0:
        data, _ = req("POST", "/transactions", token=token, body={
            "type":"receita","amount":config["renda_extra"],"category":"freelance",
            "description":f"Freelance/babysitting mês {mes}","jar":"play",
            "date": data_base.isoformat()
        })
        if data and data.get("success"):
            mes_data["transacoes"].append({"type":"receita","amount":config["renda_extra"],"desc":"Freelance"})
        time.sleep(2)

    # 3. Lançar despesas (distribuídas)
    despesas = [
        ("habitacao", "Renda", config["despesas_base"] * 0.55, "necessities"),
        ("alimentacao", "Supermercado", config["despesas_base"] * 0.18, "necessities"),
        ("transportes", "Passe Navegante", 40, "necessities"),
        ("saude", "Farmácia", 25, "necessities"),
        ("lazer", "Lazer", config["despesas_base"] * 0.05, "play"),
        ("educacao", "Educação", 20, "education"),
    ]
    log(f"Despesas: {config['despesas_base']}€ distribuídos", "money")
    for cat, desc, valor, jar in despesas:
        if valor > 0:
            req("POST", "/transactions", token=token, body={
                "type":"despesa","amount":round(valor,2),"category":cat,
                "description":f"{desc} mês {mes}","jar":jar,
                "date": data_base.isoformat()
            })
            mes_data["transacoes"].append({"type":"despesa","amount":round(valor,2),"desc":desc})
            time.sleep(1.5)

    # 4. Pagar dívidas (snowball)
    if config["divida_pago"] > 0 and divida_ids:
        log(f"Pagando {config['divida_pago']}€ em dívidas", "debt")
        # Pagar primeira dívida (menor: Irmã Marta)
        for did in divida_ids[2:]:  # Irmã Marta primeiro
            data, _ = req("POST", f"/debts/{did}/payment", token=token, body={
                "amount": config["divida_pago"],
                "notes": f"Pagamento mês {mes}"
            })
            if data and data.get("success"):
                mes_data["dividas_pagas"] += config["divida_pago"]
                log(f"  Pagamento registrado", "ok")
            time.sleep(2)
            break

    # 5. Atualizar meta (fundo emergência)
    if goal_fundo_id and config["poupanca"] > 0:
        log(f"Atualizando meta fundo emergência +{config['poupanca']}€", "goal")
        data, _ = req("POST", f"/goals/{goal_fundo_id}/progress", token=token, body={
            "amount": config["poupanca"]
        })
        if data and data.get("success"):
            log(f"  Meta atualizada", "ok")
        time.sleep(2)

    # 6. Investir (a partir do mês 10)
    if config.get("investimento", 0) > 0:
        log(f"Investindo {config['investimento']}€", "invest")
        # Criar investimento (apenas se premium - Bruno é premium)
        # Ana é free, então não vai funcionar, mas tentamos
        data, _ = req("POST", "/investments", token=token, body={
            "name": f"ETF S&P 500 (mês {mes})",
            "type": "fundos",
            "amount": config["investimento"],
            "currentValue": config["investimento"],
            "expectedReturn": 8,
        })
        if data and data.get("success"):
            mes_data["investimentos"] += config["investimento"]
            log(f"  Investimento criado", "ok")
        else:
            log(f"  Investimento bloqueado (Premium only)", "warn")
        time.sleep(2)

    # 7. Conversar com o Coach
    log(f"Conversando com o Coach ({len(config['coach_perguntas'])} perguntas)", "coach")
    for pergunta in config["coach_perguntas"]:
        data, _ = req("POST", "/coach/chat", token=token, body={"message": pergunta})
        if data and data.get("success"):
            reply = data.get("data",{}).get("reply","")[:200]
            visual = data.get("data",{}).get("visual")
            mes_data["coach_msgs"].append({
                "pergunta": pergunta,
                "resposta_preview": reply,
                "visual": visual.get("type") if visual else None
            })
            log(f"  P: {pergunta[:50]}...", "coach")
            if visual:
                log(f"    Visual: {visual.get('type')}", "ok")
        time.sleep(3)

    # 8. Pedir visual (se configurado)
    if config.get("visual"):
        log(f"Pedindo visual: {config['visual']}", "coach")
        data, _ = req("POST", "/coach/chat", token=token, body={"message": config["visual"]})
        if data and data.get("success"):
            visual = data.get("data",{}).get("visual")
            if visual:
                mes_data["visual_gerado"] = visual.get("type")
                log(f"  Visual gerado: {visual.get('type')}", "ok")
            else:
                log(f"  Visual não gerado", "warn")
        time.sleep(3)

    # 9. Ver notificações
    log("Verificando notificações...", "notif")
    data, _ = req("GET", "/notifications", token=token)
    if data and data.get("success"):
        notifs = data.get("data",{}).get("notifications",[])
        mes_data["notificacoes"] = len(notifs)
        log(f"  {len(notifs)} notificações", "notif")
        # Marcar todas como lidas
        req("PUT", "/notifications/read-all", token=token)
    time.sleep(2)

    # 10. Ver relatório mensal
    log("Gerando relatório mensal...", "info")
    data, _ = req("GET", f"/reports/monthly?month={data_base.month}&year={data_base.year}", token=token)
    if data and data.get("success"):
        r = data.get("data",{})
        mes_data["relatorio"] = {
            "income": r.get("totalIncome", 0),
            "expenses": r.get("totalExpenses", 0),
            "balance": r.get("savings", 0),
            "transactionCount": r.get("transactionCount", 0)
        }
        log(f"  Receitas: {r.get('totalIncome',0)}€ | Despesas: {r.get('totalExpenses',0)}€ | Saldo: {r.get('savings',0)}€", "money")
    time.sleep(2)

    # 11. Ver resumo geral
    data, _ = req("GET", "/reports/summary", token=token)
    if data and data.get("success"):
        s = data.get("data",{})
        mes_data["resumo_geral"] = {
            "totalDebt": s.get("totalDebt", 0),
            "poupMoedas": s.get("poupMoedas", 0),
            "level": s.get("level", 0),
            "xp": s.get("xp", 0),
            "streak": s.get("streak", 0),
            "financialMode": s.get("financialMode", "?")
        }
        log(f"  Dívida total: {s.get('totalDebt',0)}€ | PoupMoedas: {s.get('poupMoedas',0)} | Level: {s.get('level',0)}", "info")

    historico["meses"].append(mes_data)
    log(f"Mês {mes} concluído!", "ok")
    time.sleep(2)

# ============================================================
# 4. RESUMO FINAL
# ============================================================
section("4. RESUMO DA EVOLUÇÃO DE 12 MESES")

print(f"\n{BOLD}Evolução mensal da Ana:{RESET}\n")
print(f"{'Mês':<4} {'Modo':<15} {'Salário':<10} {'Saldo':<10} {'Dívidas':<10} {'Poup.':<10} {'Invest.':<10} {'Coach':<8} {'Visual':<10}")
print("-" * 95)

for m in historico["meses"]:
    rel = m.get("relatorio",{})
    resumo = m.get("resumo_geral",{})
    saldo = rel.get("balance", 0)
    divida = resumo.get("totalDebt", 0)
    poup = m.get("poupanca", 0)
    invest = m.get("investimentos", 0)
    coach = len(m.get("coach_msgs", []))
    visual = m.get("visual_gerado", "—") or "—"
    print(f"{m['mes']:<4} {m['modo']:<15} {m['salario']}€{'':<5} {saldo}€{'':<5} {divida}€{'':<5} {poup}€{'':<5} {invest}€{'':<5} {coach:<8} {visual}")

# Estatísticas finais
total_transacoes = sum(len(m["transacoes"]) for m in historico["meses"])
total_coach = sum(len(m["coach_msgs"]) for m in historico["meses"])
total_visuais = sum(1 for m in historico["meses"] if m.get("visual_gerado"))
total_dividas_pagas = sum(m["dividas_pagas"] for m in historico["meses"])
total_investido = sum(m["investimentos"] for m in historico["meses"])

historico["resumo_final"] = {
    "total_transacoes": total_transacoes,
    "total_mensagens_coach": total_coach,
    "total_visuais_gerados": total_visuais,
    "total_dividas_pagas": total_dividas_pagas,
    "total_investido": total_investido,
    "evolucao_modos": [m["modo"] for m in historico["meses"]],
    "salario_inicial": MESES_CONFIG[0]["salario"],
    "salario_final": MESES_CONFIG[-1]["salario"],
}

print(f"\n{BOLD}Estatísticas finais:{RESET}")
print(f"  Total de transações: {total_transacoes}")
print(f"  Total de mensagens com Coach: {total_coach}")
print(f"  Total de visuais gerados: {total_visuais}")
print(f"  Total pago em dívidas: {total_dividas_pagas}€")
print(f"  Total investido: {total_investido}€")
print(f"  Evolução de salário: {MESES_CONFIG[0]['salario']}€ → {MESES_CONFIG[-1]['salario']}€")
print(f"  Evolução de modos: {' → '.join(m['modo'] for m in MESES_CONFIG)}")

# Salvar histórico completo
with open("/home/z/my-project/download/historico_ana_12_meses.json", "w", encoding="utf-8") as f:
    json.dump(historico, f, indent=2, ensure_ascii=False)
print(f"\n📋 Histórico completo salvo em: /home/z/my-project/download/historico_ana_12_meses.json")
