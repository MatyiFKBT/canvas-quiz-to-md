// ==UserScript==
// @name         Canvas Quiz to Markdown
// @version      0.1
// @author       kiráj___arc
// @match        https://canvas.elte.hu/*/submissions/*
// @match        https://canvas.elte.hu/*/quizzes/*/history*
// @require      https://raw.githubusercontent.com/eligrey/FileSaver.js/master/dist/FileSaver.js
// @downloadURL  https://github.com/matyifkbt/canvas-quiz-to-md/raw/master/canvas_quiz_to_md.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let questions = document.querySelectorAll('.question')
    if (questions.length > 0) {
        let button = document.createElement('button');
        button.className = 'btn btn-primary';
        button.type = "button";
        button.textContent = "Mentés Markdown-ba";
        button.id = "save-to-md";
        button.addEventListener("click", save, false);
        let before = document.getElementsByClassName('quiz_score')[0];
        insertAfter(button, before);
    }

    function insertAfter(newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }
    function ch(elem, sel) {
        return elem.querySelector(sel).innerText
    }
    function chA(elem, sel) {
        return [...elem.querySelectorAll(sel)].map(e => e.innerText)
    }

    function save(with_points = false) {


        let md = '';

        const title = ch(document,'h2');
        const quiz_score = ch(document,'.quiz_score')
        const quiz_duration = ch(document,'.quiz_duration')
        md += `# ${title}\n${quiz_score}\n\n${quiz_duration}\n`

        questions.forEach(question => {
            const questionTitle = question.querySelector('.question_name').lastChild.textContent;
            const questionType = question.classList[2];
            const points = ch(question,'.user_points');
            md += `## ${questionTitle}\n${with_points ? '> ' + points : ''}\n\n`;

            switch (questionType) {
                case 'multiple_answers_question':
                    var questionText = ch(question,'.question_text');
                    md += `${questionText}\n`
                    var answers = question.querySelectorAll('.answer');
                    answers.forEach(answer => {
                        md += `- [${[...answer.classList].includes('selected_answer') ? 'x' : ' '}] ${answer.innerText.trim()}\n`
                    })
                    md += '\n'
                    break;
                case 'fill_in_multiple_blanks_question':
                    questions = chA(question, '.question_text > p').filter(e => e.trim()); // filter <p> tags without actual text
                    answers = chA(question, '.answer');
                    for (const q in questions) {
                        md += `- ${questions[q]}\n>${answers[q]}\n`
                    }
                    md += '\n'
                    break;
                case 'multiple_dropdowns_question':
                    questions = [...question.querySelectorAll('.question_text > p')].map(e=>e.firstChild.textContent.trim()).filter(e => e); // filter <p> tags without actual text
                    var answerGroups = question.querySelectorAll('.answer_group');
                    var selected_answers = chA(question,'.selected_answer');
                    for (const q in questions) {
                        md += `- ${questions[q]}\n`
                        chA(answerGroups[q], '.answer_text').forEach(answer => {
                            md += `\t- [${answer==selected_answers[q].trim()?'x':' '}] ${answer}\n`
                        })
                    }

                    md += '\n'
                    break;
                case 'multiple_choice_question':
                    questionText = ch(question, '.question_text');
                    md += `${questionText}\n`
                    answers = question.querySelectorAll('.answer');
                    answers.forEach(answer => {
                        md += `- [${[...answer.classList].includes('selected_answer') ? 'x' : ' '}] ${answer.innerText.trim()}\n`
                    })

                    md += '\n'
                    break;
                default:
                    break;
            }
        });

        var blob = new Blob([md], { type: "text/plain;charset=utf-8" });
        saveAs(blob, "quiz.md");

        return false;
    }
})();