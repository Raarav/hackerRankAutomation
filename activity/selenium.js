require("chromedriver");
const { rejects } = require("assert");
const { resolve } = require("path");
let swd = require("selenium-webdriver");
let browser = new swd.Builder();
let tab = browser.forBrowser("chrome").build(); //for opening browser
let gCodesElements, gcInputBox, gTextArea; //global varible
let tabWillBeOpenedPromise = tab.get("https://www.hackerrank.com/auth/login?h_l=body_middle_left_button&h_r=login/");

let { email,password } = require("./credential.json"); 

tabWillBeOpenedPromise
    .then(function () {
        //implicit timeout
        let findTimeOutP = tab.manage().setTimeouts({
            implicit : 10000       
        });
        return findTimeOutP;
    })
    .then(function () {
        // console.log("Home page Opened");
        let inputBoxPromise1 = tab.findElement(swd.By.css("#input-1"));
        return inputBoxPromise1;        
    }).then(function (inputBox1){
        let inputBoxWillBeFilledP1 = inputBox1.sendKeys(email);
        return inputBoxWillBeFilledP1;
    }).then(function (){
        // console.log("Data Entered");
        let inputBoxPromise2 = tab.findElement(swd.By.css("#input-2"));
        return inputBoxPromise2;
    }).then(function (inputBox2){
        let inputBoxWillBeFilledP2 = inputBox2.sendKeys(password);
        return inputBoxWillBeFilledP2;
    }).then(function (){
        let loginButton = tab.findElement(swd.By.css("button[data-analytics='LoginPassword']"));
        return loginButton;
    }).then(function (loginBut){
        let loginButtonClick = loginBut.click();
        return loginButtonClick;
    }).then(function (){
        //go to interview card
        let interviewCard = tab.findElement(swd.By.css("a[aria-labelledby='base-card-1 base-card-1-link']"));
        return interviewCard;
    }).then(function (interviewCd){
       let interviewCardClicked = interviewCd.click();
       return interviewCardClicked;
    }).then(function (){
        //go to warmup card
        let allTopics = tab.findElements(swd.By.css("a[data-analytics='PlaylistCardItem']"));
        return allTopics;
    }).then(function (warmUpCard){
       let warmUpCardClicked = warmUpCard[0].click();
       return warmUpCardClicked;
    }).then(function (){
        // console.log("Reached warm challenges page")
        // selenium
        let allQtag = tab.findElements(swd.By.css("a.js-track-click.challenge-list-item"));
        return allQtag;
    }).then(function (alQues){
        let allQLinkP = alQues.map(function (anchor) {
            return anchor.getAttribute("href");
        })
        let allLinkPromise = Promise.all(allQLinkP);
        return allLinkPromise;
    }).then(function (allQLink) {
        // serial execution of all the promises
        // ??
        let f1Promise = questionSolver(allQLink[0]);
        for (let i = 1; i < allQLink.length; i++) {
            f1Promise = f1Promise.then(function () {
                return questionSolver(allQLink[i])
            })
        }
        let lstQuestWillBeSolvedP = f1Promise;
        return lstQuestWillBeSolvedP;        
    }).then(function () {
        console.log("All questions");
    })
    .catch(function (err){
        console.log(err);
    })

function questionSolver(url) {
    return new Promise(function (resolve, reject) {
        // logic to solve a question
        let qPageWillBeOpenedP = tab.get(url);
        
        qPageWillBeOpenedP.then(function () {
            //implicit timeout
            let findTimeOutP = tab.manage().setTimeouts({
                implicit : 10000       
            });
            return findTimeOutP;
        })
        .then(function () {
            let tab_itemPromise = tab.findElements(swd.By.css(".tab-header .tab-item-color"));
            return tab_itemPromise;
        })
        .then(function (editorBtn) {
            let editorBtnWillBeclickedP = editorBtn[4].click();
            return editorBtnWillBeclickedP;
        }).then(function () {
            // check if there is lock btn then select it or find the solution
            let hlBtnP = handleLockBtn();
            return hlBtnP;
        }).then(function () {
            // get all the lang array
            let cCodeWillBecopied = copyCode();
            return cCodeWillBecopied;   
        }).then(function (code) {        
            let codeWillBepastedP = pasteCode(code); 
            return codeWillBepastedP;
        })
        .then(function () {
            resolve();
        }).catch(function (err) {
            console.log(err);
            reject(err);
        })
    });
}

function handleLockBtn() {
    return new Promise(function (resolve, reject) {
        let lockBtnWillBeFP = tab.findElement(swd.By.css(".editorial-content-locked button.ui-btn.ui-btn-normal"));
        lockBtnWillBeFP
            .then(function (lockBtn) {
                let lBtnWillBeCP = lockBtn.click();
                console.log("inside click");
                return lBtnWillBeCP;
            }).then(function () {
                resolve();
            }).catch(function () {
                console.log("Lock button wasn't found");
                resolve();
            })

    })
}

function copyCode() {
    return new Promise(function (resolve, reject) {
        // all name
        let allLangElementP = tab.findElements(swd.By.css(".hackdown-content h3"));
        // get all the code array
        let allcodeEementP = tab.findElements(swd.By.css(".hackdown-content .highlight"));
        let bothArrayP = Promise.all([allLangElementP, allcodeEementP]);
        bothArrayP
            .then(function (bothArrays) {
                let langsElements = bothArrays[0];
                gCodesElements = bothArrays[1];
                let allLangTextP = [];
                for (let i = 0; i < langsElements.length; i++) {
                    let cLangP = langsElements[i].getText();
                    allLangTextP.push(cLangP);
                }
                return Promise.all(allLangTextP);
            })
            .then(function (allLangs) {
                let codeOfCP;
                for (let i = 0; i < allLangs.length; i++) {
                    if (allLangs[i].includes("C++")) {
                        codeOfCP = gCodesElements[i].getText();
                        break;
                    }
                }
                return codeOfCP;
            }).then(function (code) {
                // console.log(code)
                resolve(code);
                console.log("resolved was called");
            }).catch(function (err) {
                reject(err);
            })
    });
}

function pasteCode(code) {
    return new Promise(function (resolve, reject) {
        // click on problem tab
        let pTabWillBeSelectedP = tab.findElements(swd.By.css(".tab-header .tab-item-color"));
        pTabWillBeSelectedP.then(function (pTab) {
            let pTwillBeClickedP = pTab[0].click();
            return pTwillBeClickedP;
        }).then(function () {
            let inputBoxWBeSP = tab.findElement(swd.By.css(".custom-input-checkbox")); 
            return inputBoxWBeSP;
        }).then(function (inputBox) {
            let inputbWillBeCP = inputBox.click();
            return inputbWillBeCP;
        }).then(function () {
            let cInputWillBeSelectedP = tab.findElement(swd.By.css(".custominput"));
            return cInputWillBeSelectedP;
        }).then(function (cInputBox) {
            gcInputBox = cInputBox;
            let codeWillBeEnteredP = cInputBox.sendKeys(code);
            return codeWillBeEnteredP;
        }).then(function () {
            let ctrlAWillBeSendP = gcInputBox.sendKeys(swd.Key.CONTROL + "a");
            return ctrlAWillBeSendP;
        }).then(function () {
            let ctrlXWillBeSendP = gcInputBox.sendKeys(swd.Key.CONTROL + "x");
            return ctrlXWillBeSendP;
        })
        .then(function () {
            let tAreaP = tab.findElement(swd.By.css("textarea"));
            // console.log(2);
            return tAreaP;
        }).then(
            function (tArea) {
                gTextArea = tArea;
                let CodeWillBeEP = tArea.sendKeys(swd.Key.CONTROL + "a");
                // console.log(3);
                return CodeWillBeEP;
            }).then(function () {
                let ctrlVWillBeSendP = gTextArea.sendKeys(swd.Key.CONTROL + "v");
                return ctrlVWillBeSendP;
            }).then(function () {
                let submitCodeBtnWillBeS = tab.findElement(swd.By.css("button.hr-monaco-submit"));
                return submitCodeBtnWillBeS;
            }).then(function (submitBtn) {
                let submitBtnWillBeClickedP = submitBtn.click();
                return submitBtnWillBeClickedP;
            })
        .then(function () {
            resolve();
        }).catch(function (err) {
            reject(err);
        })
        // write the code 
        // submit the code 
    })
}   