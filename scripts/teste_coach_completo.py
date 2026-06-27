#!/usr/bin/env python3
"""
Teste completo do Coach com várias mensagens para descobrir bloqueios.
Usa a conta da Ana (free) para testar.
"""
import requests
import time
import json
from datetime import datetime

API_BASE = "https://poupt-api-3tyo.onrender.com/api"
ORIGIN = "https://poupt-pwa.vercel.app"

GREEN = "\033[92m"; RED = "\033[91m"; YELLOW = "\033[93m"
CYAN = "\033[96m"; BOLD = "\033[1m"; RESET = "\033[0m"

def login(email, password):
    r = requests.post(f"{API_BASE}/auth/login",
        json={"email": email, "password": password},
        headers={"Origin": ORIGIN}, timeout=60)
    return r.json().get("token")

def send_msg(token, msg):
    r = requests.post(f"{API_BASE}/coach/chat",
        json={"message": msg},
        headers={"Authorization": f"Bearer {token}", "Origin": ORIGIN},
        timeout=180)
    return r.json()

# Mensagens de teste cobrindo vários cenários
TESTES = [
    # === PERGUNTAS FINANCEIRAS VÁLIDAS ===
    ("Quero pagar minhas dívidas. Como fazer?", "finanças_básico"),
    ("Como posso poupar mais dinheiro todos os meses?", "poupança"),
    ("Quanto devo ter no fundo de emergência?", "fundo_emergencia"),
    ("Como distribuir meu salário pelos 6 frascos?", "frascos"),
    ("Devo investir em ETFs ou ações individuais?", "investimento"),
    ("Como renegociar minha dívida com o banco?", "renegociação"),
    ("Quero comprar um carro. Vale a pena?", "compra_carro"),
    ("Tenho uma meta de comprar o Bigster de 33k. O que achas?", "meta_bigster"),
    ("Como sair do modo sobrevivência?", "modo_financeiro"),
    ("Quais funcionalidades premium tenho?", "app_features"),
    
    # === PEDIDOS DE VISUAIS ===
    ("Mostra-me uma imagem do Bigster", "visual_imagem"),
    ("Gera um gráfico dos meus frascos", "visual_grafico"),
    ("Faz um fluxograma de como quitar dívidas", "visual_fluxograma"),
    ("Quero ver um gráfico de pizza das minhas despesas", "visual_pizza"),
    ("Desenha um diagrama do plano de pagamento", "visual_diagrama"),
    ("Cria uma imagem de como seria minha casa própria", "visual_imagem_casa"),
    
    # === TÓPICOS FORA DO ESCOPO (devem bloquear) ===
    ("Quem ganhou o jogo do Benfica ontem?", "futebol_bloqueio"),
    ("O que achas do governo atual?", "politica_bloqueio"),
    ("Me conta uma piada", "off_topic_piada"),
    ("Qual a melhor receita de bacalhau?", "culinaria_bloqueio"),
    ("Como está o tempo em Lisboa hoje?", "clima_bloqueio"),
    
    # === CASOS LIMÍTROFES (podem bloquear incorretamente) ===
    ("Como pago a renda de casa este mês?", "renda_casa"),
    ("Quero viajar de férias. Quanto poupar?", "viagem_ferias"),
    ("Meu filho precisa de material escolar. Como economizar?", "filho_escola"),
    ("Devo comprar um iPhone 15 ou 14?", "comparacao_iphone"),
    ("Como abrir um negócio com pouco dinheiro?", "negocio"),
    ("Quero mudar de emprego. Como negociar salário?", "carreira"),
    ("Vale a pena fazer um curso online de 200€?", "curso_online"),
]

# Login como Ana
print(f"{BOLD}{CYAN}{'='*75}{RESET}")
print(f"{BOLD}{CYAN}  TESTE COMPLETO DO COACH - Conta Ana{RESET}")
print(f"{BOLD}{CYAN}{'='*75}{RESET}")
print()

token = login("ana.costa.lisboa.1782575998@example.com", "AnaLisboa@2026")
if not token:
    print(f"{RED}❌ Login falhou{RESET}")
    exit(1)
print(f"✅ Login Ana OK\n")

resultados = []

for msg, categoria in TESTES:
    print(f"\n{BOLD}Categoria: {categoria}{RESET}")
    print(f"📝 Pergunta: {msg}")
    
    try:
        r = send_msg(token, msg)
        if not r.get("success"):
            print(f"{RED}❌ Erro: {r.get('error')}{RESET}")
            resultados.append({"categoria": categoria, "msg": msg, "erro": r.get("error")})
            continue
        
        data = r.get("data", {})
        reply = data.get("reply", "")
        blocked = data.get("blocked", False)
        visual = data.get("visual")
        
        status = f"{RED}🚫 BLOQUEADO" if blocked else f"{GREEN}✅ RESPONDEU"
        print(f"{status}{RESET} (blocked={blocked})")
        
        if visual:
            print(f"{CYAN}🖼️  Visual gerado: {visual.get('type')}{RESET}")
            if visual.get("mermaidCode"):
                print(f"   Mermaid: {visual['mermaidCode'][:100]}...")
            if visual.get("url"):
                print(f"   URL: {visual['url']}")
        
        # Mostrar primeiros 200 chars da resposta
        print(f"💬 Resposta: {reply[:200]}...")
        
        resultados.append({
            "categoria": categoria,
            "msg": msg,
            "blocked": blocked,
            "visual": visual.get("type") if visual else None,
            "reply_length": len(reply),
            "reply_preview": reply[:200]
        })
        
    except Exception as e:
        print(f"{RED}❌ Exceção: {e}{RESET}")
        resultados.append({"categoria": categoria, "msg": msg, "erro": str(e)})
    
    time.sleep(3)  # Evitar rate limit

# Resumo final
print(f"\n{BOLD}{CYAN}{'='*75}{RESET}")
print(f"{BOLD}{CYAN}  RESUMO FINAL{RESET}")
print(f"{BOLD}{CYAN}{'='*75}{RESET}\n")

total = len(resultados)
bloqueados = sum(1 for r in resultados if r.get("blocked"))
com_visual = sum(1 for r in resultados if r.get("visual"))
erros = sum(1 for r in resultados if r.get("erro"))

print(f"Total de testes: {total}")
print(f"{GREEN}✅ Responderam: {total - bloqueados - erros}{RESET}")
print(f"{RED}🚫 Bloqueados: {bloqueados}{RESET}")
print(f"{CYAN}🖼️  Com visual: {com_visual}{RESET}")
print(f"{RED}❌ Erros: {erros}{RESET}")

print(f"\n{BOLD}Detalhes por categoria:{RESET}")
for r in resultados:
    status = "🚫" if r.get("blocked") else ("❌" if r.get("erro") else "✅")
    visual_str = f" [{r.get('visual')}]" if r.get("visual") else ""
    print(f"  {status} {r['categoria']}{visual_str}")

# Salvar relatório
with open("/home/z/my-project/download/teste_coach_ana.json", "w", encoding="utf-8") as f:
    json.dump({
        "test_run": datetime.now().isoformat(),
        "user": "ana.costa.lisboa.1782575998@example.com",
        "summary": {
            "total": total,
            "bloqueados": bloqueados,
            "com_visual": com_visual,
            "erros": erros,
        },
        "resultados": resultados,
    }, f, indent=2, ensure_ascii=False)
print(f"\n📋 Relatório salvo em: /home/z/my-project/download/teste_coach_ana.json")
