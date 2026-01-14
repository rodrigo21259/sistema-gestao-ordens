# Sistema de Gestão de Ordens e Ranking - TODO

## Fase 1: Arquitetura e Banco de Dados
- [x] Definir e criar schema do banco de dados (users, orders, custom_fields, order_custom_values, ranking_metrics)
- [x] Configurar autenticação com Manus OAuth
- [x] Implementar sistema de roles (ADMIN, OPERATOR)

## Fase 2: Backend (tRPC Procedures)
- [x] Criar procedures para gerenciamento de usuários (list, create, update, delete, promote to admin)
- [x] Criar procedures para registro de ordens (create, list, update, delete)
- [x] Criar procedures para campos dinâmicos (list, create, update, delete, toggle active)
- [x] Criar procedures para valores de campos dinâmicos (create, update, delete)
- [x] Criar procedures para métricas de ranking (list, update weights)
- [x] Implementar cálculo automático de ranking
- [x] Criar procedures para recuperar ranking com posições

## Fase 3: Interface de Registro de Ordens (OPERATOR)
- [x] Criar página de registro de ordens
- [x] Implementar formulário com campos fixos (cliente, produto, volume, receita)
- [x] Integrar campos dinâmicos no formulário
- [x] Validação de formulário
- [x] Feedback visual de sucesso/erro
- [x] Listagem de ordens registradas pelo operador

## Fase 4: Visualização de Ranking
- [x] Criar página de ranking
- [x] Exibir top 3 com destaque (limão #EBEB70)
- [x] Exibir posição do usuário atual
- [x] Exibir tabela completa de ranking
- [x] Mostrar métricas (receita, quantidade de ordens, score)
- [x] Atualização em tempo real ou refresh manual

## Fase 5: Painel Administrativo
- [x] Criar layout do painel admin com sidebar
- [x] Implementar seção de gerenciamento de usuários
- [x] Implementar seção de gerenciamento de campos dinâmicos
- [x] Implementar seção de configuração de métricas de ranking
- [x] Implementar seção de visualização de todas as ordens
- [x] Proteger rotas admin com verificação de role

## Fase 6: Identidade Visual e Temas
- [x] Configurar cores da empresa (roxo #9966FF, limão #EBEB70)
- [x] Implementar tema claro
- [x] Implementar tema escuro (sem fundo preto puro)
- [x] Aplicar temas em todos os componentes
- [x] Criar switcher de tema
- [x] Garantir contraste e legibilidade em ambos os temas

## Fase 7: Testes e Qualidade
- [ ] Escrever testes unitários para procedures críticas
- [ ] Testar fluxo de autenticação
- [ ] Testar cálculo de ranking
- [ ] Testar validações de formulário
- [ ] Testar permissões de roles

## Fase 8: Deploy e Documentação
- [ ] Preparar documentação de uso
- [ ] Criar instruções de deploy
- [ ] Configurar variáveis de ambiente
- [ ] Fazer checkpoint final
- [ ] Entregar projeto ao usuário
