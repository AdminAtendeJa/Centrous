#!/usr/bin/env python3
import sys
sys.path.insert(0, '/tmp')
import patch_legal, json

inpath = '/home/victorm21/Descargas/AtendeJá /ADMINISTRADOR DE TRABAJO/FILTRADOR ESTUDIO JURIDICO /original_workflow.json'
outpath = '/home/victorm21/Descargas/AtendeJá /ADMINISTRADOR DE TRABAJO/FILTRADOR ESTUDIO JURIDICO /workflow_estudio_juridico.json'

with open(inpath, encoding='utf-8') as f:
    wf = json.load(f)

result = patch_legal.patch(wf)

with open(outpath, 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print('OK - Nodos:', len(result['nodes']), '- Conexiones:', len(result['connections']))
