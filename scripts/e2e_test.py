#!/usr/bin/env python3
"""
Dossiê de Testes E2E — Poupt API
Simula um usuário real atravessando todas as funcionalidades do app.
"""
import json
import time
import sys
import requests
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple

API_BASE = "https://poupt-api-3tyo.onrender.com/api"
ORIGIN = "https://poupt-pwa.vercel.app"
TIMEOUT = 60

GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"

results = []
current_section = ""


def log(msg, level="info"):
    icons = {"info": "•", "ok": "✓", "err": "✗", "warn": "⚠", "step": "→"}
    colors = {"info": CYAN, "ok": GREEN, "err": RED, "warn": YELLOW, "step": BOLD}
    icon = icons.get(level, "•")
    color = colors.get(level, RESET)
    print(f"{color}{icon} {msg}{RESET}")


def section(name):
    global current_section
    current_section = name
    print(f"\n{BOLD}{CYAN}{'='*70}{RESET}")
    print(f"{BOLD}{CYAN}  {name}{RESET}")
    print(f"{BOLD}{CYAN}{'='*70}{RESET}")


def record(test_name, success, http_status=None, detail="", response_snippet=""):
    results.append({
        "section": current_section,
        "test": test_name,
        "success": success,
        "http_status": http_status,
        "detail": detail,
        "response_snippet": response_snippet[:300] if response_snippet else "",
    })
    icon = "✓" if success else "✗"
    color = GREEN if success else RED
    status_str = f" [HTTP {http_status}]" if http_status else ""
    print(f"{color}{icon} {test_name}{status_str}{RESET}")
    if detail:
        print(f"   {detail}")
    if response_snippet and not success:
        print(f"   → Resposta: {response_snippet[:200]}")


def make_request(method, endpoint, token=None, body=None, expect_status=None):
    url = f"{API_BASE}{endpoint}"
    headers = {"Content-Type": "application/json", "Origin": ORIGIN}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    try:
        resp = requests.request(method, url, headers=headers,
                                json=body if body else None, timeout=TIMEOUT)
        try:
            data = resp.json()
        except Exception:
            data = None
        return data, resp.status_code, resp.text[:1000]
    except requests.Timeout:
        return None, 0, "TIMEOUT (>60s)"
    except Exception as e:
        return None, 0, str(e)[:500]


TEST_EMAIL = f"maria.silva.e2e.{int(time.time())}@example.com"
TEST_PASSWORD = "Maria@2026"
TEST_NAME = "Maria Silva"

token = None
user_id = None
created_ids = {"transactions": [], "goals": [], "debts": [], "investments": []}


# 1. REGISTRO
section("1. AUTENTICAÇÃO — Registro de nova conta")
print(f"   Email: {TEST_EMAIL}")
data, status, raw = make_request("POST", "/auth/register", body={
    "name": TEST_NAME, "email": TEST_EMAIL, "password": TEST_PASSWORD})
if status == 201 and data and data.get("token"):
    token = data["token"]
    user = data.get("data", {}).get("user", {})
    user_id = user.get("_id") or user.get("id")
    record("Registrar nova conta", True, status,
           f"Token recebido. User ID: {user_id}. PoupMoedas: {user.get('poupMoedas')}")
    record("Resposta inclui user object", bool(user), status,
           f"Coach: {user.get('coachName')}. Modo: {user.get('financialMode')}")
else:
    record("Registrar nova conta", False, status, raw[:300])


# 2. LOGIN
section("2. AUTENTICAÇÃO — Login")
data, status, raw = make_request("POST", "/auth/login", body={
    "email": TEST_EMAIL, "password": TEST_PASSWORD})
if status == 200 and data and data.get("token"):
    record("Login com credenciais válidas", True, status,
           f"Streak: {data.get('data', {}).get('user', {}).get('streak')}")
else:
    record("Login com credenciais válidas", False, status, raw[:300])

data, status, raw = make_request("POST", "/auth/login", body={
    "email": TEST_EMAIL, "password": "senha_errada"})
record("Login com senha errada rejeitado", status == 401, status,
       f"Mensagem: {data.get('error') if data else 'sem msg'}")


# 3. PERFIL
section("3. PERFIL — GET /auth/me")
data, status, raw = make_request("GET", "/auth/me", token=token)
if status == 200 and data and data.get("data"):
    u = data["data"].get("user", data["data"])
    record("GET /auth/me", True, status,
           f"Nome: {u.get('name')}. Email: {u.get('email')}. Plan: {u.get('plan')}")
    has_password = "password" in (u if isinstance(u, dict) else {})
    record("Password NÃO é retornado no perfil", not has_password, status)
else:
    record("GET /auth/me", False, status, raw[:300])


# 4. ONBOARDING
section("4. ONBOARDING")
onboarding_data = {
    "income": 1250, "incomeFrequency": "mensal", "hasDebts": True,
    "coachName": "Ricardo", "coachGender": "m", "coachPersonality": "disciplinado",
    "avatar": "👩",
    "jarPercentages": {"necessities": 50, "freedom": 10, "savings": 10,
                       "education": 10, "play": 10, "give": 10},
    "currency": "EUR", "language": "pt",
}
data, status, raw = make_request("PUT", "/auth/me/onboarding", token=token, body=onboarding_data)
record("Completar onboarding", status == 200, status,
       f"Income: {data.get('data', {}).get('user', {}).get('income') if data else '?'}",
       raw[:300] if status != 200 else "")


# 5. TRANSAÇÕES
section("5. TRANSAÇÕES — Receitas e despesas")
data, status, raw = make_request("POST", "/transactions", token=token, body={
    "type": "receita", "amount": 1250, "category": "salario",
    "description": "Salário junho", "jar": "necessities",
    "date": datetime.now().isoformat()})
if status == 201 and data:
    tid = data.get("data", {}).get("_id")
    if tid: created_ids["transactions"].append(tid)
    record("Lançar receita (salário 1250€)", True, status, f"ID: {tid}")
else:
    record("Lançar receita (salário 1250€)", False, status, raw[:300])

data, status, raw = make_request("POST", "/transactions", token=token, body={
    "type": "receita", "amount": 250, "category": "freelance",
    "description": "Freelance design logo", "jar": "freedom",
    "date": datetime.now().isoformat()})
if status == 201 and data:
    tid = data.get("data", {}).get("_id")
    if tid: created_ids["transactions"].append(tid)
    record("Lançar receita (freelance 250€)", True, status)
else:
    record("Lançar receita (freelance 250€)", False, status, raw[:300])

despesas = [
    ("despesa", 550, "habitacao", "Renda", "necessities"),
    ("despesa", 180, "alimentacao", "Supermercado Pingo Doce", "necessities"),
    ("despesa", 45, "transportes", "Passe Navegante", "necessities"),
    ("despesa", 60, "lazer", "Cinema + jantar", "play"),
    ("despesa", 35, "educacao", "Curso Udemy", "education"),
    ("despesa", 50, "saude", "Farmácia", "necessities"),
]
for tipo, valor, cat, desc, jar in despesas:
    data, status, raw = make_request("POST", "/transactions", token=token, body={
        "type": tipo, "amount": valor, "category": cat,
        "description": desc, "jar": jar, "date": datetime.now().isoformat()})
    if status == 201 and data:
        tid = data.get("data", {}).get("_id")
        if tid: created_ids["transactions"].append(tid)
        record(f"Lançar despesa: {desc} ({valor}€)", True, status)
    else:
        record(f"Lançar despesa: {desc} ({valor}€)", False, status, raw[:300])

data, status, raw = make_request("GET", "/transactions", token=token)
if status == 200 and data:
    txs = data.get("data", {}).get("transactions", [])
    record("Listar transações", True, status, f"Total: {len(txs)}")
else:
    record("Listar transações", False, status, raw[:300])

data, status, raw = make_request("GET", "/transactions/summary", token=token)
if status == 200 and data:
    s = data.get("data", {})
    record("Resumo de transações", True, status,
           f"Receitas: {s.get('totalIncome')} | Despesas: {s.get('totalExpense')} | Saldo: {s.get('balance')}")
else:
    record("Resumo de transações", False, status, raw[:300])


# 6. FRASCOS
section("6. FRASCOS (JARS)")
data, status, raw = make_request("GET", "/jars", token=token)
if status == 200 and data:
    jars = data.get("data", {}).get("jars", [])
    record("Listar frascos", True, status,
           f"Frascos: {len(jars) if isinstance(jars, list) else 'obj'}")
else:
    record("Listar frascos", False, status, raw[:300])


# 7. METAS
section("7. METAS (GOALS)")
data, status, raw = make_request("POST", "/goals", token=token, body={
    "name": "Fundo de Emergência", "targetAmount": 3750, "currentAmount": 200,
    "type": "fundo_emergencia",
    "deadline": (datetime.now() + timedelta(days=365)).isoformat()})
if status == 201 and data:
    gid = data.get("data", {}).get("_id")
    if gid: created_ids["goals"].append(gid)
    record("Criar meta (Fundo Emergência 3750€)", True, status, f"ID: {gid}")
else:
    record("Criar meta (Fundo Emergência 3750€)", False, status, raw[:300])

data, status, raw = make_request("POST", "/goals", token=token, body={
    "name": "Viagem Porto", "targetAmount": 400, "currentAmount": 50,
    "type": "compra", "deadline": (datetime.now() + timedelta(days=90)).isoformat()})
if status == 201 and data:
    gid = data.get("data", {}).get("_id")
    if gid: created_ids["goals"].append(gid)
    record("Criar meta (Viagem Porto 400€)", True, status)
else:
    record("Criar meta (Viagem Porto 400€)", False, status, raw[:300])

if created_ids["goals"]:
    goal_id = created_ids["goals"][0]
    data, status, raw = make_request("POST", f"/goals/{goal_id}/progress",
                                      token=token, body={"amount": 100})
    record("Atualizar progresso da meta (+100€)", status in [200, 201], status,
           f"Novo montante: {data.get('data', {}).get('currentAmount') if data else '?'}",
           raw[:300] if status not in [200, 201] else "")

data, status, raw = make_request("GET", "/goals", token=token)
record("Listar metas", status == 200, status,
       f"Total: {len(data.get('data', {}).get('goals', [])) if data else '?'}",
       raw[:300] if status != 200 else "")


# 8. DÍVIDAS + SNOWBALL
section("8. DÍVIDAS + SNOWBALL")
dividas = [
    {"creditorName": "WiZink", "amount": 2500, "minimumPayment": 80,
     "interestRate": 18, "dueDate": (datetime.now() + timedelta(days=30)).isoformat(),
     "type": "formal", "status": "ativo"},
    {"creditorName": "Cartão Continente", "amount": 800, "minimumPayment": 40,
     "interestRate": 24, "dueDate": (datetime.now() + timedelta(days=15)).isoformat(),
     "type": "formal", "status": "ativo"},
    {"creditorName": "João (amigo)", "amount": 200, "minimumPayment": 50,
     "interestRate": 0, "dueDate": (datetime.now() + timedelta(days=60)).isoformat(),
     "type": "formal", "status": "ativo"},
]
for d in dividas:
    data, status, raw = make_request("POST", "/debts", token=token, body=d)
    if status == 201 and data:
        did = data.get("data", {}).get("_id")
        if did: created_ids["debts"].append(did)
        record(f"Criar dívida: {d['creditorName']} ({d['amount']}€)", True, status)
    else:
        record(f"Criar dívida: {d['creditorName']} ({d['amount']}€)", False, status, raw[:300])

data, status, raw = make_request("GET", "/debts", token=token)
record("Listar dívidas", status == 200, status,
       f"Total: {len(data.get('data', {}).get('debts', [])) if data else '?'}",
       raw[:300] if status != 200 else "")

data, status, raw = make_request("GET", "/debts/snowball?extraBudget=50", token=token)
record("Calcular bola de neve (extraBudget=50)", status == 200, status,
       f"Meses: {data.get('data', {}).get('mesesParaLiberdade') if data else '?'}",
       raw[:300] if status != 200 else "")

data, status, raw = make_request("GET", "/debts/snowball-detailed?extraBudget=100", token=token)
record("Calcular bola de neve detalhada", status == 200, status,
       f"Timeline: {len(data.get('data', {}).get('timeline', [])) if data else '?'} eventos",
       raw[:300] if status != 200 else "")

if created_ids["debts"]:
    debt_id = created_ids["debts"][0]
    data, status, raw = make_request("POST", f"/debts/{debt_id}/payment",
                                      token=token, body={"amount": 80, "notes": "Pagamento mensal"})
    record("Adicionar pagamento a dívida (80€)", status in [200, 201], status,
           f"AmountPaid: {data.get('data', {}).get('amountPaid') if data else '?'}",
           raw[:300] if status not in [200, 201] else "")


# 9. INVESTIMENTOS
section("9. INVESTIMENTOS")
investimentos = [
    {"name": "Fundo S&P 500", "type": "fundos", "amount": 500,
     "currentValue": 540, "expectedReturn": 8},
    {"name": "Cripto BTC", "type": "cripto", "amount": 200,
     "currentValue": 280, "expectedReturn": 15},
]
for inv in investimentos:
    data, status, raw = make_request("POST", "/investments", token=token, body=inv)
    if status == 201 and data:
        iid = data.get("data", {}).get("_id")
        if iid: created_ids["investments"].append(iid)
        record(f"Criar investimento: {inv['name']} ({inv['amount']}€)", True, status)
    else:
        record(f"Criar investimento: {inv['name']} ({inv['amount']}€)", False, status, raw[:300])

data, status, raw = make_request("GET", "/investments", token=token)
record("Listar investimentos", status == 200, status,
       f"Total: {len(data.get('data', {}).get('investments', [])) if data else '?'}",
       raw[:300] if status != 200 else "")


# 10. COACH AI
section("10. COACH AI — Chat")
data, status, raw = make_request("POST", "/coach/chat", token=token, body={
    "message": "Olá! Recebo 1250€ por mês e tenho 3 dívidas. Como devo começar?"})
record("Coach: enviar mensagem inicial", status == 200, status,
       f"Resposta: {(data.get('data', {}).get('response', '')[:120] + '...') if data and data.get('data', {}).get('response') else 'verificar'}",
       raw[:400] if status != 200 else "")

data, status, raw = make_request("POST", "/coach/chat", token=token, body={
    "message": "Quanto devo ter no fundo de emergência?"})
record("Coach: enviar follow-up", status == 200, status,
       f"Resposta recebida: {bool(data.get('data', {}).get('response')) if data else False}",
       raw[:400] if status != 200 else "")

data, status, raw = make_request("GET", "/coach/history", token=token)
record("Coach: carregar histórico", status == 200, status,
       f"Mensagens: {len(data.get('data', {}).get('messages', [])) if data else '?'}",
       raw[:300] if status != 200 else "")


# 11. NOTIFICAÇÕES
section("11. NOTIFICAÇÕES")
data, status, raw = make_request("GET", "/notifications", token=token)
if status == 200 and data:
    notifs = data.get("data", {}).get("notifications", [])
    record("Listar notificações", True, status, f"Total: {len(notifs)}")
    if notifs:
        nid = notifs[0].get("_id")
        data2, status2, _ = make_request("PUT", f"/notifications/{nid}/read", token=token)
        record("Marcar notificação como lida", status2 == 200, status2)
    data3, status3, _ = make_request("PUT", "/notifications/read-all", token=token)
    record("Marcar todas como lidas", status3 == 200, status3)
else:
    record("Listar notificações", False, status, raw[:300])


# 12. REPORTS
section("12. RELATÓRIOS")
now = datetime.now()
data, status, raw = make_request("GET", "/reports/summary", token=token)
record("Reports: sumário geral", status == 200, status,
       f"Dados: {bool(data.get('data')) if data else False}",
       raw[:300] if status != 200 else "")

data, status, raw = make_request("GET", f"/reports/monthly?month={now.month}&year={now.year}", token=token)
record(f"Reports: mensal ({now.month}/{now.year})", status == 200, status,
       f"Dados: {bool(data.get('data')) if data else False}",
       raw[:300] if status != 200 else "")

data, status, raw = make_request("GET", "/reports/debt-progress", token=token)
record("Reports: progresso de dívidas", status == 200, status,
       f"Dados: {bool(data.get('data')) if data else False}",
       raw[:300] if status != 200 else "")


# 13. POUPMOEDAS
section("13. POUPMOEDAS")
data, status, raw = make_request("GET", "/moedas/balance", token=token)
record("PoupMoedas: obter saldo", status == 200, status,
       f"Saldo: {data.get('data', {}).get('balance') if data else '?'}",
       raw[:300] if status != 200 else "")

data, status, raw = make_request("POST", "/moedas/earn", token=token, body={"action": "daily_login"})
record("PoupMoedas: ganhar (daily_login)", status == 200, status,
       f"Novo saldo: {data.get('data', {}).get('balance') if data else '?'}",
       raw[:300] if status != 200 else "")

data, status, raw = make_request("POST", "/moedas/earn", token=token, body={"action": "acao_inexistente"})
record("PoupMoedas: ação inválida rejeitada", status in [400, 404], status,
       f"Mensagem: {data.get('error') if data else '?'}")

data, status, raw = make_request("POST", "/moedas/earn", token=token,
                                  body={"action": "watch_ad", "amount": 999999})
if status == 200 and data:
    novo_saldo = data.get("data", {}).get("balance", 0)
    record("⚠️ BUG: earn com amount=999999 creditado (C4)", False, status,
           f"Saldo após abuso: {novo_saldo}")
else:
    record("Earn com amount arbitrário rejeitado", True, status)


# 14. MODE DETECTION
section("14. DETEÇÃO DE MODO")
data, status, raw = make_request("POST", "/auth/me/detect-mode", token=token)
record("Detectar modo financeiro", status == 200, status,
       f"Modo: {data.get('data', {}).get('mode') if data else '?'}",
       raw[:300] if status != 200 else "")


# 15. PERFIL — Atualizar
section("15. PERFIL — Atualizar preferências")
data, status, raw = make_request("PUT", "/auth/me", token=token, body={
    "name": "Maria Silva Lopes", "currency": "EUR", "language": "pt",
    "notificationSettings": {"debtReminders": True, "goalAlerts": True,
                             "coachTips": True, "weeklyReports": False},
    "privacySettings": {"analytics": True, "personalizedTips": True}})
record("Atualizar perfil", status == 200, status,
       f"Nome: {data.get('data', {}).get('user', {}).get('name') if data else '?'}",
       raw[:300] if status != 200 else "")

data, status, raw = make_request("PUT", "/auth/me/mode", token=token, body={"financialMode": "recuperacao"})
record("Atualizar modo financeiro manual", status == 200, status,
       f"Modo: {data.get('data', {}).get('user', {}).get('financialMode') if data else '?'}",
       raw[:300] if status != 200 else "")

data, status, raw = make_request("PUT", "/auth/me/coach", token=token, body={
    "coachName": "Ricardão", "coachGender": "m", "coachPersonality": "amigavel"})
record("Atualizar preferências do coach", status == 200, status,
       f"Coach: {data.get('data', {}).get('user', {}).get('coachName') if data else '?'}",
       raw[:300] if status != 200 else "")


# 16. CRUD COMPLETO
section("16. CRUD — Editar e excluir")
if created_ids["transactions"]:
    tx_id = created_ids["transactions"][-1]
    data, status, raw = make_request("PUT", f"/transactions/{tx_id}", token=token, body={
        "amount": 55, "description": "Farmácia (editado)"})
    record("Editar transação", status == 200, status,
           f"Novo valor: {data.get('data', {}).get('amount') if data else '?'}",
           raw[:300] if status != 200 else "")

if len(created_ids["transactions"]) > 1:
    tx_id = created_ids["transactions"][1]
    data, status, raw = make_request("DELETE", f"/transactions/{tx_id}", token=token)
    record("Excluir transação", status == 200, status,
           f"ID: {tx_id}", raw[:300] if status != 200 else "")

if created_ids["goals"]:
    goal_id = created_ids["goals"][-1]
    data, status, raw = make_request("PUT", f"/goals/{goal_id}", token=token, body={
        "name": "Viagem Porto (revisto)", "targetAmount": 500})
    record("Editar meta", status == 200, status,
           f"Novo alvo: {data.get('data', {}).get('targetAmount') if data else '?'}",
           raw[:300] if status != 200 else "")


# 17. SEGURANÇA
section("17. SEGURANÇA — Validação de autorização")
data, status, raw = make_request("GET", "/transactions")
record("GET /transactions sem token rejeitado", status in [401, 403], status,
       f"Mensagem: {data.get('error') if data else '?'}")

data, status, raw = make_request("GET", "/auth/me", token="token_invalido_123")
record("GET /auth/me com token inválido rejeitado", status in [401, 403], status,
       f"Mensagem: {data.get('error') if data else '?'}")


# 18. LOGOUT
section("18. LOGOUT")
data, status, raw = make_request("POST", "/auth/logout", token=token)
record("Logout", status in [200, 204], status,
       f"Mensagem: {data.get('message') if data else 'sem msg'}",
       raw[:300] if status not in [200, 204] else "")


# RESUMO
section("RESUMO DO DOSSIÊ DE TESTES")
total = len(results)
success = sum(1 for r in results if r["success"])
failed = total - success
success_pct = (success / total * 100) if total else 0

print(f"\n{BOLD}Total de testes: {total}{RESET}")
print(f"{GREEN}Sucessos: {success}{RESET}")
print(f"{RED}Falhas: {failed}{RESET}")
print(f"{YELLOW}Taxa de sucesso: {success_pct:.1f}%{RESET}")

report_path = "/home/z/my-project/download/test-report.json"
import os
os.makedirs("/home/z/my-project/download", exist_ok=True)
with open(report_path, "w", encoding="utf-8") as f:
    json.dump({
        "test_run": datetime.now().isoformat(),
        "test_user_email": TEST_EMAIL,
        "summary": {"total": total, "success": success, "failed": failed, "success_pct": round(success_pct, 1)},
        "results": results,
    }, f, indent=2, ensure_ascii=False)
print(f"\nRelatório JSON salvo em: {report_path}")

sys.exit(0 if failed == 0 else 1)
