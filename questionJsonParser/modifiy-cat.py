import json
import sys
from random import shuffle


def modify(path):
    data = json.load(open(path))
    cats = getCats(data)
    data['indices'] = getIndices(data, cats)
    ranges, idxs = getCatQRang(data)
    for qKey in data['questions']:
        q = data['questions'][qKey]
        cleanQuestion(q)
        if isValid(q, cats):
            label = getLabel(q)
            tmpIdx = idxs[q["subCat"]][label]
            whichRang = ranges[q["subCat"]][label]
            if whichRang and tmpIdx is not None and tmpIdx < len(whichRang):
                data['questions'][qKey]["DiffSubCatIdx"] = str(q["difficulty"]) + q["subCat"] + str(whichRang[tmpIdx])
                idxs[q["subCat"]][label] += 1
    with open(path.split('.')[0] + '.newA.json', 'w') as f:
        json.dump(data, f, indent=4)


def mergeCats(newCatKey, oldCatKey, data):
    cats = getCats(data)
    for qKey in data['questions']:
        q = data['questions'][qKey]
        if isValid(q, cats) and q["subCat"] == oldCatKey:
            q["subCat"] = newCatKey
    data["categories"][oldCatKey] = None


def isValid(q, cats):
    if 'subCat' not in q or \
                    'cat' not in q or \
                    "difficulty" not in q or \
                    q['subCat'] not in cats or \
                    q['cat'] not in cats:
        q["reported"] = True
        return False
    return True


def cleanQuestion(q):
    if int(q['difficulty']) == 1:
        q['difficulty'] = "1"
    elif int(q['difficulty']) == 2:
        q['difficulty'] = "2"
    elif int(q['difficulty']) == 3:
        q['difficulty'] = "3"
    q["language"] = None
    q["DiffIdx"] = None
    q["DiffCatIdx"] = None
    q["language"] = None
    q["cats"] = None
    q["time"] = None
    q["idx1"] = None
    q["idx2"] = None
    q["subCat_time"] = None
    q["user_time"] = None


def getLabel(q):
    if int(q['difficulty']) == 1:
        label = "easy"
    elif int(q['difficulty']) == 2:
        label = "intermediate"
    elif int(q['difficulty']) == 3:
        label = "difficult"
    else:
        print q
        raise
    return label


def getIndices(data, cats):
    catIdxs = {}
    for cat in cats:
        catIdxs[cat] = {"all": 0, "easy": 0, "intermediate": 0, "difficult": 0}
    for qKey in data['questions']:
        q = data['questions'][qKey]
        if isValid(q, cats):
            label = getLabel(q)
            if 'subCat' in q and q['subCat'] in catIdxs:
                catIdxs[q['subCat']][label] += 1
                catIdxs[q['subCat']]["all"] += 1
            if 'cat' in q and q['cat'] in catIdxs:
                catIdxs[q['cat']][label] += 1
                catIdxs[q['cat']]["all"] += 1
                # if 'subCat' in q and q['subCat'] in catIdxs:
                #     catIdxs[q['subCat']]["all"] += 1
                # if 'cat' in q and q['cat'] in catIdxs:
                #     catIdxs[q['cat']]["all"] += 1
                # if q['difficulty'] == "1":
                #     if 'subCat' in q and q['subCat'] in catIdxs:
                #         catIdxs[q['subCat']]["easy"] += 1
                #     if 'cat' in q and q['cat'] in catIdxs:
                #         catIdxs[q['cat']]["easy"] += 1
                # elif q['difficulty'] == "2":
                #     if 'subCat' in q and q['subCat'] in catIdxs:
                #         catIdxs[q['subCat']]["intermediate"] += 1
                #     if 'cat' in q and q['cat'] in catIdxs:
                #         catIdxs[q['cat']]["intermediate"] += 1
                # elif q['difficulty'] == "3":
                #     if 'subCat' in q and q['subCat'] in catIdxs:
                #         catIdxs[q['subCat']]["difficult"] += 1
                #     if 'cat' in q and q['cat'] in catIdxs:
                #         catIdxs[q['cat']]["difficult"] += 1
    return catIdxs


def getCatQRang(data):
    ranges, idxs = {}, {}
    for cat in getCats(data):
        ranges[cat], idxs[cat] = {}, {}
        ranges[cat]["easy"] = range(data['indices'][cat]["easy"])
        idxs[cat]["easy"] = 0
        shuffle(ranges[cat]["easy"])
        ranges[cat]["intermediate"] = range(data['indices'][cat]["intermediate"])
        shuffle(ranges[cat]["intermediate"])
        idxs[cat]["intermediate"] = 0
        ranges[cat]["difficult"] = range(data['indices'][cat]["difficult"])
        shuffle(ranges[cat]["difficult"])
        idxs[cat]["difficult"] = 0
    return ranges, idxs


def getCats(data):
    cats = []
    for cKey in data['categories']:
        cats.append(cKey)
    return cats


def makeMathParentCat(data):
    mathKey = '-KzTUIuq00A4xZWN-xbZ'
    newSubCatKey = 'L91DDz2_2sJA1ptnCyw'
    cats = getCats(data)
    for qKey in data['questions']:
        q = data['questions'][qKey]
        if isValid(q, cats) and q["subCat"] == mathKey:
            q["cat"] = mathKey
            q["subCat"] = newSubCatKey


def correctReportedQuestions(path):
    data = json.load(open(path))
    mathKey = '-KzTUIuq00A4xZWN-xbZ'
    newSubCatKey = '-L91DDz2_2sJA1ptnCyw'
    reported = 0
    for qKey in data['questions']:
        q = data['questions'][qKey]
        if q["cat"] == mathKey and q["subCat"] == newSubCatKey:
            q["reported"] = False
            reported += 1
    with open(path.split('.')[0] + '.new.json', 'w') as f:
        json.dump(data, f, indent=4)


def updateQuestionNumWithDiff(path):
    data = json.load(open(path))
    cats = getCats(data)
    data['indices'] = getIndices(data, cats)
    for cat in cats:
        data['categories'][cat]['questionNumber_1'] = data['indices'][cat]["easy"]
        data['categories'][cat]['questionNumber_2'] = data['indices'][cat]["difficult"]
        data['categories'][cat]['questionNumber_3'] = data['indices'][cat]["intermediate"]
    with open(path.split('.')[0] + '.newA.json', 'w') as f:
        json.dump(data, f, indent=4)


reload(sys)
sys.setdefaultencoding('utf8')

path = 'questionapp-fdb6a-export.json'

modify(path)
# updateQuestionNumWithDiff(path)

# makeMathParentCat(data)
# mergeCats('-KzTNzBKHu6E3qu1u16r', '-KzTV5esQWMtGKgSY7jj', data)
# mergeCats('-KzTGlLwQ8JYTQh5FleS', '-KzTH3qIr7lm3mErV1j7', data)
# mergeCats('-KzTIHFaCDbnJ_cr9NRm', '-KzTHunaUnY_fVEDa3lZ', data)
# mergeCats('-KzTGJAgDewqzMpAe3Xu', '-KzS2z1T77sdYn7wSWj5', data)
# modify(path)
