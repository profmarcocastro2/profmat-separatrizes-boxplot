# Medidas Separatrizes e Boxplot - PROFMAT 2025

Este repositório contém o código-fonte, a documentação teórica e o roteiro didático de apoio para a Prova Didática da disciplina de Probabilidade e Estatística do PROFMAT.
O tema foca nas Medidas Separatrizes, construção do Boxplot e a prova analítica do Fator 1.5 de John Tukey.

## Estrutura do Projeto
- `app.py`: Aplicação web iterativa construída com Streamlit.
- `modules/`: Módulos em Python contendo a lógica matemática, geração dos gráficos e deduções estatísticas.
- `docs/`: Roteiro de aula, demonstrações formais, declaração de uso de IA e referências ABNT.
- `data/`: Dados amostrais.

## Como Executar no WSL (Windows Subsystem for Linux)

1. **Abra o seu terminal do WSL (Ubuntu/Debian).**
2. **Navegue até o diretório do projeto:**
   ```bash
   cd "/mnt/c/Users/profm/OneDrive/Documentos/PROFMAT 2025/11. PROBABILIDADE E ESTATÍSTICA/Medidas Separatrizes/profmat-separatrizes-boxplot"
   ```
3. **Crie um ambiente virtual (recomendado):**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
4. **Instale as dependências:**
   ```bash
   pip install -r requirements.txt
   ```
5. **Execute a aplicação Streamlit:**
   ```bash
   streamlit run app.py
   ```
6. Acesse a URL fornecida no terminal pelo navegador (geralmente `http://localhost:8501`).
