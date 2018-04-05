import json
import sys
from random import shuffle


def modify(p):
    data = json.load(open(p))
    data['statistics']['lastIdx'] = len(data['questions'])
    easyQ, interQ, diffQ = 0, 0, 0
    for qKey in data['questions']:
        q = data['questions'][qKey]
        if q['difficulty'] == "1":
            easyQ += 1
        elif q['difficulty'] == "2":
            interQ += 1
        elif q['difficulty'] == "3":
            diffQ += 1
    easyIdxs = range(easyQ)
    interIdxs = range(interQ)
    diffIdxs = range(diffQ)
    data['statistics']['easyQuestNum'] = easyQ
    data['statistics']['interQuestNum'] = interQ
    data['statistics']['diffQuestNum'] = diffQ
    shuffle(easyIdxs)
    shuffle(interIdxs)
    shuffle(diffIdxs)

    easyIdxLocal, interIdxLocal, diffIdxLocal = -1, -1, -1
    for qKey in data['questions']:
        q = data['questions'][qKey]
        if q['difficulty'] == "1":
            easyIdxLocal += 1
            idx = easyIdxs[easyIdxLocal]
        elif q['difficulty'] == "2":
            interIdxLocal += 1
            idx = interIdxs[interIdxLocal]
        elif q['difficulty'] == "3":
            diffIdxLocal += 1
            idx = diffIdxs[diffIdxLocal]
        if 'cat' not in q and 'subCat' in q:
            q['cat'] = getParentCat(q['subCat'], data)
        else:
            q['DiffCatIdx'] = str(q['difficulty']) + q['cat'] + str(idx)
        if 'subCat' in q:
            q['DiffSubCatIdx'] = str(q['difficulty']) + q['subCat'] + str(idx)
        q['DiffIdx'] = str(q['difficulty']) + str(idx)
    with open(p[3:].split('.')[0] + '.modified.json', 'w') as f:
        json.dump(data, f)


def getParentCat(subCatKey, data):
    for cKey in data['categories']:
        if subCatKey == cKey:
            c = data['categories'][cKey]
            return c['parentKey']
    return None


reload(sys)
sys.setdefaultencoding('utf8')
path = '../backup-25-03-2018.json'
modify(path)
