import os, sys
import datetime

def parse(path):
    catIdx = 0
    categoryDic = dict()
    questions = []
    jsonTxt = '{ "questions" : ['
    for subdir, dirs, files in os.walk(path):
        for txtFile in files:
            file = open(os.path.join(path, txtFile))
            question = []
            for line in file:
                if line.replace(" ", "") == '\n':
                    if question:
                        questions.append(question)
                    question = []
                else:
                    question.append(line.strip())
            for question in questions:
                questionJson = '{'
                # idx = questions.index(question)
                # questionJson += '"{0}": {1},'.format('idx', idx)
                category = txtFile[:-4]
                if category not in categoryDic:
                    categoryDic[category] = catIdx
                    catIdx += 1
                questionJson += '"cats": [ {"key": ' + '"{1}" '.format('subCat', categoryDic[category]) + ' } ],'
                #questionJson += '"subCats": [ {"key": ' + '"{1}" '.format('subCat', categoryDic[category]) + ' } ],'
                text = question[0]
                if not text.endswith("?"):
                    text += ' ?'
                questionJson += '"{0}": "{1}",'.format('imageUrl', '')
                questionJson += '"{0}": "{1}",'.format('content', text)
                otherChoices = []
                if len(question) == 5:
                    answerType = 'multipleChoices'
                    choises = '"choices": ['
                    for line in question[1:]:
                        if '*' in line:
                            answer = line.replace('*', '').replace(' ', '')
                        else:
                            otherChoices.append(line)
                    for choice in otherChoices:
                        choises += '{' + '"{0}": "{1}"'.format('text', choice) + '},'
                    choises = choises[:-1] + '],'
                    questionJson += choises
                elif len(question) == 2:
                    answer = question[1].replace('*', '').replace(' ', '')
                    answerType = 'fillBlank'
                    questionJson += '"choices": [],'

                questionJson += '"{0}": "{1}",'.format('language', 'arabic')
                questionJson += '"{0}": "{1}",'.format('time',datetime.datetime.now() )
                questionJson += '"{0}": {1},'.format('difficulty', '2')
                questionJson += '"{0}": "{1}",'.format('answer', answer)
                questionJson += '"{0}": "{1}",'.format('answerType', answerType)
                questionJson += '"{0}": "{1}"'.format('questionType', 'text')
                questionJson += '}, '
                jsonTxt += questionJson
            questions = []
    jsonTxt = jsonTxt.strip()[:-1] + '],'

    categoryText = '"categories": {'
    for cat in categoryDic.keys():
        categoryText +=  '"'+ str(categoryDic[cat]) +  '": { "displayName": "' + cat[0].upper() + cat[1:] + '",'
        categoryText += '"alias":"' + cat.lower() + '",'
        categoryText += '"hasParent" : false,'
        categoryText += '"displayNameArabic" : " ",'
        categoryText += '"parentKey" : null},'
    categoryText = categoryText[:-1] + '}'
    jsonTxt += categoryText + '}'
    file = open('questions.json', 'w')
    # jsonTxt = json.dumps(jsonTxt, indent=1, sort_keys=True)
    file.write(jsonTxt)


reload(sys)
sys.setdefaultencoding('utf8')
parse('questions')
