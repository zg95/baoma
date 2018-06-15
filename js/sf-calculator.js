/*jshint sub:true*/
$.noConflict();
var initializeSFCalculator;
var resize_timeout;
jQuery(document).ready(function ($) {
    var develop = false;
    var RESOURCE_PATH = "https://sfcn-webcal-prod.bmwgroup.com/jscomponent/js";
    var XML_CONFIG_FILE_PATH = RESOURCE_PATH + "/config.xml";
    var HOST_URL = develop ? "http://punitp7440s/BMWFS.SFWebCal/CalcEngineDigitalService.svc/" : "https://sfcn-webcal-prod.bmwgroup.com/BMWFS.SFCalcEngine/CalcEngineDigitalService.svc/";
    var INT3 = "GetAllFinanceProduct";
    var INT12 = "GetSubProductBalloondata";
    var INT14 = "GetCalculation";
    var NORMAL_TAB = 'normaltab';
    var BALLOON_TAB = 'ballontab';
    var BONUS_TAB = 'bonustab';
    var STEPDOWN_TAB = 'stepdowntab';
    var regexp = /{([^{]+)}/g;
    var staticDataFromXML = null;
    var rightArrowButtonProduct = 0;
    var leftArrowButtonProduct = 0;
    var compareNumsInScreenProduct = 0;
    var rightArrowButtonTerm = 0;
    var leftArrowButtonTerm = 0;
    var compareNumsInScreenTerm = 0;
    var resizeId;
    var resizeTerms;
    var windowElem = $(window);
    var windowWidth = windowElem.width();
    window.addEventListener('resize', function () {
        if (windowElem.width() != windowWidth) {
            windowWidth = windowElem.width();
            clearTimeout(resizeId);
            clearTimeout(resizeTerms);
            resizeId = setTimeout(resizeProductTabs, 500);
            resizeTerms = setTimeout(resizeTermsUI(windowElem, true), 500);
        }
    }, true);
    initializeSFCalculator = (function ($) {
        return (function (reference) {
            sfElementObject = document.getElementById(reference);

            if (typeof sfElementObject.updateInputValues != "undefined") {
                return;
            }

            sfElementObject.data = null;
            sfElementObject.responseData = {};
            sfElementObject.topHeaderNavClicked = false;
            sfElementObject.innerNavClicked = false;
            sfElementObject.topHeaderNavBaseX = 0;
            sfElementObject.innerNavBaseX = 0;
            sfElementObject.Balloon = "PSABA";
            sfElementObject.Bullet = "PSABU"; //Bonus
            sfElementObject.Normal = "PSANO";
            sfElementObject.StepDown = "PSASD";
            sfElementObject.StepUp = "PSASU";
            sfElementObject.marketID = "CN";
            sfElementObject.showPurchaseTax = false;
            sfElementObject.loading = sfElementObject.innerHTML;
            addSFCalLoadingData(sfElementObject);
            sfElementObject.subProducts = {};
            sfElementObject.errormsgdata = [];
            sfElementObject.selectedSubProductDetails = {
                'subProductId': 0,
                'subProductInternalId': 0,
                'defaultIndex': 0,
                'defaultType': NORMAL_TAB
            };
            sfElementObject.updateInputValues = function (obj) {
                var currentElementRef = this;
                if (typeof staticDataFromXML == "undefined" || staticDataFromXML == null) {
                    initiateXMLAjaxCall(XML_CONFIG_FILE_PATH, function (response) {
                        var x = response.getElementsByTagName("languages");
                        var img = response.getElementsByTagName("img");
                        staticDataFromXML = {};
                        staticDataFromXML["img"] = {};
                        $(img).children("label").each(function () {
                            staticDataFromXML["img"][$(this).attr("name")] = $(this).text();
                        });
                        $(x).children("language").each(function () {
                            var language = $(this).attr("name");
                            staticDataFromXML[language] = {};
                            $(this).children().each(function () {
                                staticDataFromXML[language][$(this).attr("name")] = $(this).text();
                            });
                        });
                        updateSFCalInputData(currentElementRef, obj);
                    }, sfElementObject);
                }
                else {
                    console.log("[Update InputValues]");
                    updateSFCalInputData(currentElementRef, obj);
                }
            };
            function updateSFCalInputData(elementRef, obj) {
                elementRef.data = obj;
                elementRef.interestRateChecked = false;
                elementRef.subProductIdChecked = false;
                elementRef.subProductIdAvailable = true;
                elementRef.termsResized = true;
                elementRef.productsResized = true;
                var dataSubID = isEmpty(elementRef.data["SUBPROD_ID"]) ? true : false;
                var dataSubIntID = isEmpty(elementRef.data["SUBPROD_INTERNAL_ID"]) ? true : false;
                var dataSubArray = [];
                dataSubArray.push(dataSubID);
                dataSubArray.push(dataSubIntID);
                boolCount = dataSubArray.reduce(function (a, b) {
                    return b ? ++a : a;
                }, 0);
                if (boolCount == 1)
                    elementRef.subProductIdAvailable = false;
                if (isAvailable(elementRef.data["DOWN_PAYMENT"]) && isAvailable(elementRef.data["MSRP"])) {
                    elementRef.data["DOWN_PAYMENT_PCT"] = ((parseFloat((elementRef.data["DOWN_PAYMENT"])) / parseFloat((elementRef.data["MSRP"]))) * 100);
                }
                if (isAvailable(elementRef.data["BALLOON_AMT"]) && isAvailable(elementRef.data["MSRP"])) {
                    elementRef.data["BALLOON_PCT"] = ((elementRef.data["BALLOON_AMT"] / elementRef.data["MSRP"]) * 100);
                }
                if (isAvailable(elementRef.data["BONUS_AMT"]) && isAvailable(elementRef.data["MSRP"])) {
                    elementRef.data["BONUS_PCT_DATA"] = elementRef.data["BONUS_AMT"];
                }
                if (isAvailable(elementRef.data["STEPDOWN_PCT"])) {
                    elementRef.data["STEPDOWN_PCT"] = elementRef.data["STEPDOWN_PCT"];
                }
                if (typeof obj != "undefined" && obj != null) {
                    if (isAvailable(obj["AG_VG_CODE"]) && isAvailable(obj["MSRP"]) &&
                        isAvailable(obj["CUSTOMER_TYPE"]) && isAvailable(obj["VEHICLE_STATUS"]) &&
                        isAvailable(obj["CHANNEL_ID"]) && isAvailable(obj["THEME_ID"]) && elementRef.subProductIdAvailable) {
                        var INT3_RQ_BODY = {
                            "MARKET_ID": elementRef.marketID,
                            "CHANNEL_ID": elementRef.data["CHANNEL_ID"],
                            "BRAND": elementRef.data["THEME_ID"],
                            "VEHICLE_STATUS": elementRef.data["VEHICLE_STATUS"],
                            "CUSTOMER_TYPE": elementRef.data["CUSTOMER_TYPE"],
                            "AG_VG_CODE": elementRef.data["AG_VG_CODE"]
                        };
                        initiateAjaxCall(JSON.stringify(INT3_RQ_BODY),
                            HOST_URL + INT3, elementRef.int3ResponseHandle, elementRef, sfElementObject);
                    } else {
                        sfErrorMsg(elementRef, staticDataFromXML[elementRef.marketID]['INPUT_ERROR'], 1005);
                    }
                }
            }
            sfElementObject.int3ResponseHandle = function (response, reference) {
                $(sfElementObject).css("display", "block");
                if (response["STATUS"]["STATUS_CODE"] == "Error") {
                    reference.errormsgdata = [];
                    reference.errormsgdata.push(response["STATUS"]);
                    constructerrorUI(reference);
                } else {
                    reference.subProducts[BALLOON_TAB] = [];
                    reference.subProducts[BONUS_TAB] = [];
                    reference.subProducts[NORMAL_TAB] = [];
                    reference.subProducts[STEPDOWN_TAB] = [];
                    reference.subProducts["StepUp"] = [];
                    var boolCount;
                    var type = NORMAL_TAB;
                    var index = 0;
                    if (!isNotVailable(response) && !isNotVailable(response["STATUS"]) &&
                        !isNotVailable(response["STATUS"]["STATUS_CODE"]) && response["STATUS"]["STATUS_CODE"] == "OK" &&
                        !isNotVailable(response["STATUS"]["ERROR_CODE"]) && response["STATUS"]["ERROR_CODE"] == "0" &&
                        !isNotVailable(response["SUBPRODLIST"]) && response["SUBPRODLIST"].length > 0) {
                        for (var i = 0; i < response["SUBPRODLIST"].length; i++) {
                            if (!isNotVailable(response["SUBPRODLIST"][i]["DEFAULT_PAYMENT_TYPE"])) {
                                switch (response["SUBPRODLIST"][i]["DEFAULT_PAYMENT_TYPE"]) {
                                    case reference.Balloon:
                                        reference.subProducts[BALLOON_TAB].push(response["SUBPRODLIST"][i]);
                                        break;
                                    case reference.Bullet:
                                        reference.subProducts[BONUS_TAB].push(response["SUBPRODLIST"][i]);
                                        break;
                                    case reference.Normal:
                                        reference.subProducts[NORMAL_TAB].push(response["SUBPRODLIST"][i]);
                                        break;
                                    case reference.StepDown:
                                        reference.subProducts[STEPDOWN_TAB].push(response["SUBPRODLIST"][i]);
                                        break;
                                    case reference.StepUp:
                                        reference.subProducts["StepUp"].push(response["SUBPRODLIST"][i]);
                                        break;
                                }
                            }
                        }
                        if (isAvailable(reference.data["SUBPROD_ID"]) &&
                            isAvailable(reference.data["SUBPROD_INTERNAL_ID"])) {
                            type = -1;
                            index = getSelectedTabIndexValue(reference, NORMAL_TAB);
                            if (index != -1)
                                type = NORMAL_TAB;

                            if (type == -1) {
                                index = getSelectedTabIndexValue(reference, BALLOON_TAB);
                                if (index != -1)
                                    type = BALLOON_TAB;
                            }
                            if (type == -1) {
                                index = getSelectedTabIndexValue(reference, BONUS_TAB);
                                if (index != -1)
                                    type = BONUS_TAB;
                            }
                            if (type == -1) {
                                index = getSelectedTabIndexValue(reference, STEPDOWN_TAB);
                                if (index != -1)
                                    type = STEPDOWN_TAB;
                            }
                        } else {
                            if (typeof reference.subProducts[NORMAL_TAB] == "undefined" || reference.subProducts[NORMAL_TAB].length == 0) {
                                if (typeof reference.subProducts[BALLOON_TAB] != "undefined" && reference.subProducts[BALLOON_TAB].length > 0) {
                                    type = BALLOON_TAB;
                                } else {
                                    if (typeof reference.subProducts[BONUS_TAB] != "undefined" && reference.subProducts[BONUS_TAB].length > 0) {
                                        type = BONUS_TAB;
                                    } else {
                                        if (typeof reference.subProducts[STEPDOWN_TAB] != "undefined" && reference.subProducts[STEPDOWN_TAB].length > 0) {
                                            type = STEPDOWN_TAB;
                                        } else {
                                            type = -1;
                                        }
                                    }

                                }
                            }
                            if (type != -1) {
                                index = getSelectedTabIndexValue(reference, NORMAL_TAB, true);
                                if (index != -1)
                                    type = NORMAL_TAB;
                                else {
                                    index = getSelectedTabIndexValue(reference, BALLOON_TAB, true);
                                    if (index != -1)
                                        type = BALLOON_TAB;
                                    else {
                                        index = getSelectedTabIndexValue(reference, BONUS_TAB, true);
                                        if (index != -1)
                                            type = BONUS_TAB;
                                        else {
                                            index = getSelectedTabIndexValue(reference, STEPDOWN_TAB, true);
                                            if (index != -1)
                                                type = STEPDOWN_TAB;
                                        }
                                    }
                                }
                            }
                        }
                        if (type != -1) {
                            if (index == -1)
                                index = 0;
                            reference.selectedSubProductDetails['defaultIndex'] = index;
                            reference.selectedSubProductDetails['defaultType'] = type;
                            reference.selectedSubProductDetails['subProductId'] = reference.subProducts[reference.selectedSubProductDetails['defaultType']][reference.selectedSubProductDetails['defaultIndex']]['SUBPROD_ID'];
                            reference.selectedSubProductDetails['subProductInternalId'] = reference.subProducts[reference.selectedSubProductDetails['defaultType']][reference.selectedSubProductDetails['defaultIndex']]['SUBPROD_INTERNAL_ID'];
                            if (type == BALLOON_TAB &&
                                reference.subProducts[BALLOON_TAB][index]['PRODUCT_BALLOON_MATRIX_ID'] != "undefined") {
                                var inputData = {
                                    "reference": reference,
                                    "index": index
                                };
                                var INT12URL = HOST_URL + INT12 + "/" + reference.marketID + "/" + reference.data["CHANNEL_ID"] + "/" +
                                    reference.subProducts[BALLOON_TAB][index]['SUBPROD_ID'] + "/" +
                                    reference.subProducts[BALLOON_TAB][index]['PRODUCT_BALLOON_MATRIX_ID'] + "/" + reference.data["AG_VG_CODE"];

                                initiateAjaxCall(null, INT12URL,
                                    function (response, referenceObject) {
                                        referenceObject["reference"].subProducts[BALLOON_TAB][referenceObject["index"]]["BALLOONLIST"] = response["BALLOONLIST"];
                                        constructUI(referenceObject["reference"]);
                                    }, inputData, sfElementObject);
                            } else {
                                constructUI(reference);
                            }
                        }
                        else {
                            //Error Handling for Sub Product ID and Internal ID 
                            index = 0;
                            type = NORMAL_TAB;
                            if (typeof reference.subProducts[NORMAL_TAB] == "undefined" || reference.subProducts[NORMAL_TAB].length == 0) {
                                if (typeof reference.subProducts[BALLOON_TAB] != "undefined" && reference.subProducts[BALLOON_TAB].length > 0) {
                                    type = BALLOON_TAB;
                                } else {
                                    if (typeof reference.subProducts[BONUS_TAB] != "undefined" && reference.subProducts[BONUS_TAB].length > 0) {
                                        type = BONUS_TAB;
                                    } else {
                                        if (typeof reference.subProducts[STEPDOWN_TAB] != "undefined" && reference.subProducts[STEPDOWN_TAB].length > 0) {
                                            type = STEPDOWN_TAB;
                                        } else {
                                            type = -1;
                                        }
                                    }

                                }
                            }
                            reference.selectedSubProductDetails['defaultIndex'] = index;
                            reference.selectedSubProductDetails['defaultType'] = type;
                            reference.selectedSubProductDetails['subProductId'] = reference.subProducts[reference.selectedSubProductDetails['defaultType']][reference.selectedSubProductDetails['defaultIndex']]['SUBPROD_ID'];
                            reference.selectedSubProductDetails['subProductInternalId'] = reference.subProducts[reference.selectedSubProductDetails['defaultType']][reference.selectedSubProductDetails['defaultIndex']]['SUBPROD_INTERNAL_ID'];
                            if (type == BALLOON_TAB &&
                                reference.subProducts[BALLOON_TAB][index]['PRODUCT_BALLOON_MATRIX_ID'] != "undefined") {
                                var inputData = {
                                    "reference": reference,
                                    "index": index
                                };
                                var INT12URL = HOST_URL + INT12 + "/" + reference.marketID + "/" + reference.data["CHANNEL_ID"] + "/" +
                                    reference.subProducts[BALLOON_TAB][index]['SUBPROD_ID'] + "/" +
                                    reference.subProducts[BALLOON_TAB][index]['PRODUCT_BALLOON_MATRIX_ID'] + "/" + reference.data["AG_VG_CODE"];

                                initiateAjaxCall(null, INT12URL,
                                    function (response, referenceObject) {
                                        referenceObject["reference"].subProducts[BALLOON_TAB][referenceObject["index"]]["BALLOONLIST"] = response["BALLOONLIST"];
                                        constructUI(referenceObject["reference"]);
                                    }, inputData, sfElementObject);
                            } else {
                                constructUI(reference);
                            }
                            sfElementObject.subProductIdChecked = true;
                            $(sfElementObject).append(sfLoadErrorMsg(staticDataFromXML[reference.marketID]['SUB_PRODUCT_ID_AND_INTERNAL_ID_MISMATCH']));
                        }
                    }
                }
            };
            sfElementObject.int14ResponseHandle = function (response, referenceObject) {
                var terms = [], __index = -1;
                for (var i = 0; i < referenceObject["root"]["subProducts"][BALLOON_TAB].length; i++) {
                    if (referenceObject["root"]["subProducts"][BALLOON_TAB][i]["SUBPROD_ID"] == referenceObject['SUBPROD_ID'] &&
                        referenceObject["root"]["subProducts"][BALLOON_TAB][i]["SUBPROD_INTERNAL_ID"] == referenceObject['SUBPROD_INTERNAL_ID'] &&
                        typeof referenceObject["root"]["subProducts"][BALLOON_TAB][i]["BALLOONLIST"] != "undefined")
                        __index = i;
                }
                if (__index != -1) {
                    var baloonP = referenceObject["default_balPCT"];
                    for (var i = 0; i < referenceObject["root"]["subProducts"][BALLOON_TAB][__index]["BALLOONLIST"].length; i++) {
                        var from = referenceObject["root"]["subProducts"][BALLOON_TAB][__index]["BALLOONLIST"][i]["MIN_BALLOON_PCT"];
                        var to = referenceObject["root"]["subProducts"][BALLOON_TAB][__index]["BALLOONLIST"][i]["MAX_BALLOON_PCT"];
                        if (baloonP >= from && baloonP <= to) {
                            terms.push({
                                'from': referenceObject["root"]["subProducts"][BALLOON_TAB][__index]["BALLOONLIST"][i]["BALLOON_FROM_TERM"],
                                'to': referenceObject["root"]["subProducts"][BALLOON_TAB][__index]["BALLOONLIST"][i]["BALLOON_TO_TERM"]
                            });
                        }
                    }
                }
                var data = {
                    'type': referenceObject["type"],
                    'terms': [],
                    'referenceData': referenceObject,
                    'rootElementRef': referenceObject["root"]
                };
                if (response["CALCLIST"].length > 0) {
                    for (var i = 0; i < response["CALCLIST"].length; i++) {
                        var stepDownData = {
                            'SFProductStepDownMonthlyInstallment': []
                        };
                        for (var j = 1; j <= 5; j++) {
                            if (response["CALCLIST"][i]["CALCULATION"]["YEAR_" + j + "_MONTHLYINSTALMENT"] != "undefined" &&
                                response["CALCLIST"][i]["CALCULATION"]["YEAR_" + j + "_MONTHLYINSTALMENT"] != null) {
                                var title = '';
                                if (j == 1) title = staticDataFromXML[referenceObject['MARKET_ID']]['YEAR_1_Label'];
                                if (j == 2) title = staticDataFromXML[referenceObject['MARKET_ID']]['YEAR_2_Label'];
                                if (j == 3) title = staticDataFromXML[referenceObject['MARKET_ID']]['YEAR_3_Label'];
                                if (j == 4) title = staticDataFromXML[referenceObject['MARKET_ID']]['YEAR_4_Label'];
                                if (j == 5) title = staticDataFromXML[referenceObject['MARKET_ID']]['YEAR_5_Label'];

                                stepDownData['SFProductStepDownMonthlyInstallment'].push({
                                    'title': title,
                                    'amount': response["CALCLIST"][i]["CALCULATION"]["YEAR_" + j + "_MONTHLYINSTALMENT"]
                                });
                            }
                        }
                        var allow = (terms.length == 0) || false;
                        for (var j = 0; j < terms.length; j++) {
                            if (terms[j]["from"] <= response["CALCLIST"][i]["SUBPRODUCT"]["TERM"] &&
                                terms[j]["to"] >= response["CALCLIST"][i]["SUBPRODUCT"]["TERM"])
                                allow = true;
                        }
                        if (allow) {
                            data['terms'].push({
                                'CALCULATION_TYPE': response["CALCLIST"][i]["CALCULATION"]["CALCULATION_TYPE"],
                                'installment': response["CALCLIST"][i]["CALCULATION"]["MONTHLY_INSTALLMENT"],
                                'term': response["CALCLIST"][i]["SUBPRODUCT"]["TERM"],
                                'interestRate': response["CALCLIST"][i]["SUBPRODUCT"]["INTEREST_RATE"],
                                'downPayment': response["CALCLIST"][i]["SUBPRODUCT"]["DOWN_PAYMENT_AMT"],
                                'balloonAmount': response["CALCLIST"][i]["SUBPRODUCT"]["BALLOON_AMT"],
                                'yearlyPayment': response["CALCLIST"][i]["SUBPRODUCT"]["BULLET_VALUE"],
                                'SFProductStepDownMonthlyInstallment': stepDownData['SFProductStepDownMonthlyInstallment']
                            });
                            if (!referenceObject['IS_INITIAL']) {
                                if (response["CALCLIST"][i]["CALCULATION"]["CALCULATION_TYPE"] == "CALEX") {
                                    referenceObject['ROOT_ELEMENT'].responseData['DOWN_PAYMENT'] = response["CALCLIST"][i]["SUBPRODUCT"]["DOWN_PAYMENT_AMT"];
                                    referenceObject['ROOT_ELEMENT'].responseData['BALLOON_AMT'] = response["CALCLIST"][i]["SUBPRODUCT"]["BALLOON_AMT"];
                                    referenceObject['ROOT_ELEMENT'].responseData['BONUS_AMT'] = response["CALCLIST"][i]["SUBPRODUCT"]["BULLET_VALUE"];
                                    referenceObject['ROOT_ELEMENT'].responseData['STEPDOWN_PCT'] = response["CALCLIST"][i]["SUBPRODUCT"]["STEP_PERCENTAGE"];
                                }
                            }
                        }
                    }
                }
                getTabContentUI(data);
            };
            sfElementObject.getDetails = function () {
                var data = {};
                var tabsSectionData = $(this).find(".tabsSectionData_SF_CAL");
                var spID = 0,
                    spINTID = 0,
                    target = '',
                    index = 0;
                var defTerm = 0;
                $(tabsSectionData).find(".tabsParent_SF_CAL").children().each(function () {
                    if ($(this).hasClass("active")) {
                        spID = $(this).attr('subproductid');
                        spINTID = $(this).attr('subproductinternalid');
                        target = $(this).attr('target');
                        index = $(this).attr('index');
                        return;
                    }
                });
                if (this.subProducts[target][index]['SUBPROD_ID'] == spID &&
                    this.subProducts[target][index]['SUBPROD_INTERNAL_ID'] == spINTID) {
                    data['SUBPROD_ID'] = this.subProducts[target][index]['SUBPROD_ID'];
                    data['SUBPROD_INTERNAL_ID'] = this.subProducts[target][index]['SUBPROD_INTERNAL_ID'];
                    data['SUBPROD_NAME'] = this.subProducts[target][index]['SUBPROD_NAME'];
                    data['SUBPROD_SHORT_DESC'] = this.subProducts[target][index]['SUBPROD_SHORT_DESC'];
                    data['SUBPROD_START_DATE'] = this.subProducts[target][index]['SUBPROD_START_DATE'];
                    data['SUBPROD_END_DATE'] = this.subProducts[target][index]['SUBPROD_END_DATE'];
                    defTerm = this.subProducts[target][index]['DEFAULT_TERM'];
                }
                //  Start of Changes for Output Json
                if (sfElementObject != null && sfElementObject.data != null) {
                    data['AG_VG_CODE'] = sfElementObject.data["AG_VG_CODE"];
                    data['CHANNEL_ID'] = parseInt(sfElementObject.data["CHANNEL_ID"]);
                    data['CUSTOMER_TYPE'] = sfElementObject.data["CUSTOMER_TYPE"];
                    data['VEHICLE_STATUS'] = sfElementObject.data["VEHICLE_STATUS"];
                    data['BRAND'] = sfElementObject.data['THEME_ID'];
                    data['MSRP'] = parseFloat(sfElementObject.data["MSRP"]);
                    data["PURCHASE_TAX"] = '';
                    if (isAvailable(sfElementObject.data["PURCHASE_TAX"])) {
                        data["PURCHASE_TAX"] = parseFloat(sfElementObject.data["PURCHASE_TAX"]);
                    }
                }
                //  End Changes for Output Json
                var tabData;
                $(tabsSectionData).find("." + target).each(function () {
                    if ($(this).attr('subproductid') == spID &&
                        $(this).attr('subproductinternalid') == spINTID) {
                        tabData = this;
                        data['DOWN_PAYMENT'] = $(tabData).children().find(".amtData_SF_CAL option:selected").val().match(/\d*\.?\d*/g).join("");
                        data['BALLOON_AMT'] = $(tabData).find("[inputtype ='ballontab_inputParent']").find(".amtData_SF_CAL option:selected").val();
                        if (isAvailable(data['BALLOON_AMT']))
                            data['BALLOON_AMT'] = data['BALLOON_AMT'].match(/\d*\.?\d*/g).join("");
                        else
                            data['BALLOON_AMT'] = "";
                        data['BONUS_AMT'] = $(tabData).find("[inputtype ='bonustab_inputParent']").find(".amtData_SF_CAL option:selected").val();
                        if (isAvailable(data['BONUS_AMT']))
                            data['BONUS_AMT'] = data['BONUS_AMT'].match(/\d*\.?\d*/g).join("");
                        else
                            data['BONUS_AMT'] = "";
                        data['STEPDOWN_PCT'] = $(tabData).find("[inputtype ='stepdowntab_inputParent']").find(".percData_SF_CAL option:selected").val();
                        if (!isAvailable(data['STEPDOWN_PCT']))
                            data['STEPDOWN_PCT'] = "";

                        data['TERM'] = $(tabData).find("[termdata]").find(".active").find(".termInterest_terms_SF_CAL").attr("selectedterm");
                        data['INTEREST_RATE'] = $(tabData).find("[termdata]").find(".active").find(".termInterest_total_SF_CAL").attr("terminterest");
                        data['MONTHLY_INSTALLMENT'] = $(tabData).find("[termdata]").find(".active").find(".termInterest_monthly_SF_CAL").text().match(/\d*\.?\d*/g).join("");

                        data['PURCHASE_TAX_INSTALLMENT'] = $(tabData).find(".purchaseTax_SF_CAL").find(".purchaseTaxData").text();
                        if (data['PURCHASE_TAX'] != "" && isAvailable(data['PURCHASE_TAX_INSTALLMENT']) && defTerm == data['TERM'])
                            data['PURCHASE_TAX_INSTALLMENT'] = data['PURCHASE_TAX_INSTALLMENT'].match(/\d*\.?\d*/g).join("");
                        else
                            data['PURCHASE_TAX_INSTALLMENT'] = "";

                        data['YEAR_1_MONTHLYINSTALMENT'] = $(tabData).find(".stepDownInstallments_SF_CAL").find(".stepdownyear_0").text();
                        if (isAvailable(data['YEAR_1_MONTHLYINSTALMENT']))
                            data['YEAR_1_MONTHLYINSTALMENT'] = data['YEAR_1_MONTHLYINSTALMENT'].match(/\d*\.?\d*/g).join("");

                        data['YEAR_2_MONTHLYINSTALMENT'] = $(tabData).find(".stepDownInstallments_SF_CAL").find(".stepdownyear_1").text();
                        if (isAvailable(data['YEAR_2_MONTHLYINSTALMENT']))
                            data['YEAR_2_MONTHLYINSTALMENT'] = data['YEAR_2_MONTHLYINSTALMENT'].match(/\d*\.?\d*/g).join("");

                        data['YEAR_3_MONTHLYINSTALMENT'] = $(tabData).find(".stepDownInstallments_SF_CAL").find(".stepdownyear_2").text();
                        if (isAvailable(data['YEAR_2_MONTHLYINSTALMENT']))
                            data['YEAR_3_MONTHLYINSTALMENT'] = data['YEAR_3_MONTHLYINSTALMENT'].match(/\d*\.?\d*/g).join("");

                        data['YEAR_4_MONTHLYINSTALMENT'] = $(tabData).find(".stepDownInstallments_SF_CAL").find(".stepdownyear_3").text();
                        if (isAvailable(data['YEAR_4_MONTHLYINSTALMENT']))
                            data['YEAR_4_MONTHLYINSTALMENT'] = data['YEAR_4_MONTHLYINSTALMENT'].match(/\d*\.?\d*/g).join("");

                        data['YEAR_5_MONTHLYINSTALMENT'] = $(tabData).find(".stepDownInstallments_SF_CAL").find(".stepdownyear_4").text();
                        if (isAvailable(data['YEAR_5_MONTHLYINSTALMENT']))
                            data['YEAR_5_MONTHLYINSTALMENT'] = data['YEAR_5_MONTHLYINSTALMENT'].match(/\d*\.?\d*/g).join("");

                    }
                });
                return data;
            };

            if (typeof inputValues != "undefined" && inputValues != null) {
                sfElementObject.updateInputValues(window[inputValues]);
            }
        });
    })($);

    function sfErrorMsg(errorData, errorMsg, errorCode) {
        $(errorData).css("display", "block");
        var errorMsgHtml = $('<div  class="error_SF_CAL col-xs-12_SF_CAL"></div>');
        var contentdiv = $('<div class="error-content_SF_CAL"></div');
        var divmsg = $('<div></div>');
        if (typeof errorCode != "undefined" && errorCode != null) {
            errorCode = ": " + "" + errorCode;
            var msgHeader = $('<h2>' + staticDataFromXML[errorData.marketID]['ERROR_MSG_HEADER'] + '</h2>');
        }
        else
            errorCode = "";

        var errormsg = $('<div class="errorMsg_SF_CAL">' + errorMsg + errorCode + '</div>');
        var okbutton = $('<div class="action_SF_CAL">' +
            '<span class="button-blue_SF_CAL buttonerror_SF_CAL">ok</span>' +
            '</div>');
        if (typeof errorCode != "undefined" && errorCode != null)
            divmsg.append(msgHeader);

        divmsg.append(errormsg);
        contentdiv.append(divmsg);
        errorMsgHtml.append(contentdiv);
        $(errorData).html(errorMsgHtml);
    }

    function sfLoadErrorMsg(message, type) {
        if ($(sfElementObject).children(".errorLoad_SF_CAL").length != 0)
            return;
        var errorClose = $('<span class=" button-blue_SF_CAL buttonerror_SF_CAL error_close">确认</span>');
        var errorParent = $('<div  class="errorLoad_SF_CAL">' +
            '<div class="errorLoad-content_SF_CAL" align="center"></div>' +
            '</div>');
        $(errorParent).children('.errorLoad-content_SF_CAL').append(
            $('<div style="display: table;">' +
                '<div class="errorMsg_SF_CAL">' + message + '</div>' +
                '<div class="action_SF_CAL"></div>' +
                '</div>'));

        $(errorParent).find(".action_SF_CAL").append(errorClose);
        $(errorClose).click(function () {
            var rootElement = $(this).parents(".errorLoad_SF_CAL").parent()[0];
            switch (type) {
                case NORMAL_TAB:
                    rootElement.data['DOWN_PAYMENT'] = "";
                    rootElement.data["DOWN_PAYMENT_PCT"] = rootElement["inputData"]["defaultPCT"];
                    break;
                case BALLOON_TAB:
                    rootElement.data['BALLOON_AMT'] = "";
                    rootElement.data['DOWN_PAYMENT'] = "";
                    rootElement.data["BALLOON_PCT"] = rootElement["inputData"]["default_balPCT"];
                    break;
                case BONUS_TAB:
                    rootElement.data['BONUS_AMT'] = "";
                    rootElement.data['DOWN_PAYMENT'] = "";
                    rootElement.data["BONUS_PCT"] = rootElement["inputData"]["default_bonPCT"];
                    break;
                case STEPDOWN_TAB:
                    rootElement.data['STEPDOWN_PCT'] = "";
                    rootElement.data['DOWN_PAYMENT'] = "";
                    rootElement.data["STEPDOWN_PCT"] = rootElement["inputData"]["default_sdPCT"];
                    break;
            }
            $(this).parents(".errorLoad_SF_CAL").hide();
            if (isAvailable(rootElement.data["SUBPROD_ID"]) && isAvailable(rootElement.data["SUBPROD_INTERNAL_ID"]) && sfElementObject.subProductIdChecked) {
                rootElement.data["SUBPROD_ID"] = "";
                rootElement.data["SUBPROD_INTERNAL_ID"] = "";
            }
            if (isAvailable(rootElement.data["INTEREST_RATE"]))
                rootElement.data["INTEREST_RATE"] = "";
            if (isAvailable(rootElement.data["TERM"]))
                rootElement.data["TERM"] = "";
            rootElement.updateInputValues(rootElement.data);
        });
        return errorParent;
    }

    function constructerrorUI(reference) {
        var data = reference.errormsgdata[0];
        var errorMsg = "";
        if (data["ERROR_CODE"] == 1002 || data["ERROR_CODE"] == 1001)
            errorMsg = staticDataFromXML[reference.marketID]['ERROR_CODE'] + ": " + data["ERROR_CODE"];
        else
            errorMsg = staticDataFromXML[reference.marketID]['ERROR_CODE'] + ": " + data["ERROR_CODE"];		//data["ERROR_TEXT"] + ": " + data["ERROR_CODE"];
        var dataAvailable = (typeof data != "undefined" && data != null);
        $(reference).empty();
        var topParent = $('<div class="topParent_SF_CAL col-xs-12_SF_CAL"></div>');
        var errorMsgHtml = $('<div  class="error_SF_CAL col-xs-12_SF_CAL"></div>');
        var contentdiv = $('<div class="error-content_SF_CAL"></div');
        var divmsg = $('<div style="display: table;width:100%"></div>');
        var msgHeader = $('<h2>' + staticDataFromXML[reference.marketID]['ERROR_MSG_HEADER'] + '</h2>');
        var errormsg = $('<div class="errorMsg_SF_CAL">' + errorMsg + '</div>');
        var okbutton = $('<div class="action_SF_CAL">' +
            '<span class="button-blue_SF_CAL buttonerror_SF_CAL">ok</span>' +
            '</div>');
        divmsg.append(msgHeader);
        divmsg.append(errormsg);
        contentdiv.append(divmsg);
        errorMsgHtml.append(contentdiv);
        $(reference).append(topParent);
        if (data["ERROR_CODE"] == 1001) {
            $(topParent).append(customerTypeUI(reference));
            if (reference.data["CUSTOMER_TYPE"] == 'Private') {
                $(topParent).find(".sf-js-customer-type").children().find('input[value=Private]').prop('checked', true);
            } else {
                $(topParent).find(".sf-js-customer-type").children().find('input[value=Corporate]').prop('checked', true);
            }
            $(topParent).append(errorMsgHtml);
        }
        else
            $(topParent).append(errorMsgHtml);
    }

    function customerTypeUI(reference) {
        var customerTypeBlock = $('<div class="sf-js-customer-type"></div>');
        $(customerTypeBlock).html($('<label class="col-xs-12_SF_CAL header1_SF_CAL" style="display:' + ((reference.data["CUSTOMER_TYPE_VISIBILITY"] == 1) ? 'block' : 'none') + '">' + staticDataFromXML[reference.marketID]['CUSTOMER_TYPE'] + ':</label>'));
        var customerTypeParent = $('<div class="col-xs-12_SF_CAL custdiv_SF_CAL" style="display:' + ((reference.data["CUSTOMER_TYPE_VISIBILITY"] == 1) ? 'block' : 'none') + '"></div>');
        var privateCustomer = $('<div style="display: inline-block;"></div>');
        var corporateCustomer = $('<div style="display: inline-block;"></div>');
        $(privateCustomer).click(function () {
            changeCustomerType('Private');
        });
        $(corporateCustomer).click(function () {
            changeCustomerType('Corporate');
        });
        $(privateCustomer).append($('<input type="radio" value="Private" name="customerType"> <label class="radio-label_SF_CAL custVal_SF_CAL paddingRight1_SF_CAL">' + staticDataFromXML[reference.marketID]['PRIVATE_CUSTOMER'] + '</label>'));
        $(customerTypeParent).append(privateCustomer);
        $(corporateCustomer).append($('<input type="radio" value="Corporate" name="customerType"> <label class="radio-label_SF_CAL custVal_SF_CAL">' + staticDataFromXML[reference.marketID]['CORPORATE_CUSTOMER'] + '</label>'));
        $(customerTypeParent).append(corporateCustomer);
        $(customerTypeBlock).append(customerTypeParent);
        return customerTypeBlock;
    }

    function constructUI(reference) {
        var data = reference.data;
        var dataAvailable = (typeof data != "undefined" && data != null);
        $(reference).empty();
        var componentInnerHtml = $('<div class="topParent_SF_CAL col-xs-12_SF_CAL"></div>');
        $(componentInnerHtml).append(customerTypeUI(reference));
        if (reference.data["CUSTOMER_TYPE"] == 'Private') {
            $(componentInnerHtml).find(".sf-js-customer-type").children().find('input[value=Private]').prop('checked', true);
        } else {
            $(componentInnerHtml).find(".sf-js-customer-type").children().find('input[value=Corporate]').prop('checked', true);
        }

        var mainTabsParent = $('<div class="col-xs-12_SF_CAL paddingTop2_SF_CAL tabsSectionData_SF_CAL sf-js-calc-main-wrap"></div>');
        var leftArrowButton = $('<button class="leftArrow_SF_CAL sf-js-carousel-arrow" target="tabsParent_SF_CAL"><i class="arrow left"></i></button>');
        $(leftArrowButton).prop("disabled", true);
        $(leftArrowButton).click(function () {
            sfElementObject.productsResized = true;
            scrollElements(this, false, 240, 700);
        });
        var rightArrowButton = $('<button class="rightArrow_SF_CAL sf-js-carousel-arrow" target="tabsParent_SF_CAL"><i class="arrow right"></i></button>');
        $(rightArrowButton).click(function () {
            scrollElements(this, true, 210, 700);
        });

        var tabsRow = $('<ul class="tabsParent_SF_CAL"></ul>');
        var carouselMain = $('<div class="sf-js-carousel-main"></div>');
        var caruselInner = $('<div class="sf-js-carousel-inner"></div>');

        constructTabs(tabsRow, reference, NORMAL_TAB);
        constructTabs(tabsRow, reference, BALLOON_TAB);
        constructTabs(tabsRow, reference, BONUS_TAB);
        constructTabs(tabsRow, reference, STEPDOWN_TAB);

        swapDefaultSelectedTab(tabsRow);

        $(tabsRow).wrap(carouselMain);
        $(carouselMain).append(leftArrowButton);
        $(carouselMain).append(rightArrowButton);
        $(carouselMain).append(caruselInner);
        $(caruselInner).append(tabsRow);
        $(mainTabsParent).append(carouselMain);

        addEmptySFTabsContent(reference, NORMAL_TAB, mainTabsParent);
        addEmptySFTabsContent(reference, BALLOON_TAB, mainTabsParent);
        addEmptySFTabsContent(reference, BONUS_TAB, mainTabsParent);
        addEmptySFTabsContent(reference, STEPDOWN_TAB, mainTabsParent);

        $(componentInnerHtml).append(mainTabsParent);

        $(reference).html(componentInnerHtml);
        var tabsContainer = $(reference).find(".sf-js-carousel-inner").find("ul");
        var liContainerWidth = $(reference).find(".sf-js-carousel-inner").width();
        var mainContainer = $(reference).find(".topParent_SF_CAL").outerWidth();

        $(tabsRow).children('li').each(function (i) {
            $(this).attr("elempos", i + 1);
        });

        if (mainContainer > 200 && mainContainer < 565) {
            $(tabsContainer).children('li').outerWidth(parseInt(liContainerWidth / 1));

        }
        else if (mainContainer > 565 && mainContainer < 767) {
            $(tabsContainer).children('li').outerWidth(parseInt(liContainerWidth / 2));
        }
        else if (mainContainer > 767 && mainContainer < 1024) {
            $(tabsContainer).children('li').outerWidth(parseInt(liContainerWidth / 3));
        }
        else {
            $(tabsContainer).children('li').outerWidth(parseInt(liContainerWidth / 4));
        }

        var tabsLiSelector = $(tabsContainer).find("li:first-child");

        var lastPos = 0;

        var carouselOuterWidth = $(caruselInner).outerWidth();

        var ulLiWidth = $(caruselInner).find('ul').children('li').outerWidth() * $(caruselInner).find('ul').children('li').length;

        if (ulLiWidth < carouselOuterWidth)
            $(caruselInner).parent().children(".rightArrow_SF_CAL").prop("disabled", true);

        var maxElementwidth = ($(tabsContainer).children('li').length) * ($(tabsContainer).children('li').outerWidth());
        var scrollWidth = maxElementwidth - ($(caruselInner).outerWidth() - 40);

        $(caruselInner).on("scroll", function () {
            onScrollTerms(scrollWidth, $(this), "subProducts");
        });

        var defaultType = reference.selectedSubProductDetails['defaultType'];
        var defaultIndex = reference.selectedSubProductDetails['defaultIndex'];
        constructIntialLoad(showOrHideTabContent(
            reference.subProducts[defaultType][defaultIndex]["SUBPROD_ID"],
            reference.subProducts[defaultType][defaultIndex]["SUBPROD_INTERNAL_ID"],
            reference), reference);

        $(reference).find(".sfProductTab_SF_CAL").click(function () {
            showTabElement(this, reference);
        });

        $(reference).find(".termInterest_SF_CAL").click(function () {
            $(this).parent().children().each(function () {
                $(this).removeClass("active");
            });
            $(this).addClass("active");
        });
        $(reference).find(".customInfoIconHover_SF_CAL").hover(function () {
            var display = $(this).parents(".tabsSectionData_SF_CAL").
                find(".sfProductNormalPopup").css("display");
            if (display == "none") {
                $(this).parents(".tabsSectionData_SF_CAL").
                    find(".sfProductNormalPopup").css("display", "block");
            } else {
                $(this).parents(".tabsSectionData_SF_CAL").
                    find(".sfProductNormalPopup").css("display", "none");
            }
        });
        $(componentInnerHtml).after('<div class="sf-js-clearfix"></div>');

    }

    function changeCustomerType(customerType) {
        sfElementObject.customerType = "";
        if (sfElementObject.customerType != customerType) {
            sfElementObject.customerType = customerType;
            sfElementObject.data["CUSTOMER_TYPE"] = customerType;
            sfElementObject.updateInputValues(sfElementObject.data);
        }
    }

    function showOrHideTabContent(subProductId, subProductInternalId, reference) {
        var tabContentParent = null;
        $(reference).find(".tabcontent_SF_CAL").each(function () {
            if ($(this).attr('subproductId') == subProductId &&
                $(this).attr('subproductInternalId') == subProductInternalId) {
                tabContentParent = $(this);
                $(this).show();
                resizeTermsUI(reference, false);
            } else {
                $(this).hide();
            }
        });
        return tabContentParent;
    }

    function scrollElements(object, addValue, scrollValue, duration) {

        var leftArrow = $(object).parents().find(".leftArrow_SF_CAL");
        var rightArrow = $(object).parents().find(".rightArrow_SF_CAL ");

        var itemWidth = $(".sfProductTab_SF_CAL").outerWidth();
        var target = $(object).attr("target");
        var liItems = $('.sf-js-carousel-inner').find('ul').children('li').length;

        var scrollWidth = ($(object).parents().children(".sf-js-carousel-inner")[0].scrollWidth);
        var ulWidth = $(object).parents().children(".sf-js-carousel-inner").width();
        var elemScrollLeft = $(object).parents().children(".sf-js-carousel-inner").scrollLeft();

        var firstChild = ($(object).parents().children(".sf-js-carousel-inner").offset().left) + ($(leftArrow).width());
        var firstChildOffset = $(object).parents().children(".sf-js-carousel-inner").find("ul li:first-child").offset().left;
        if ($(object).parents().children(".sf-js-carousel-inner:animated").length) {
            return false;
        }

        if (typeof addValue != "undefined" && addValue) {
            if (((elemScrollLeft + ulWidth) + 30) < ((liItems * itemWidth))) {
                $(object).parents().children(".sf-js-carousel-inner").animate({
                    scrollLeft: '+=' + itemWidth
                }, duration);
            }
        } else {
            if ((elemScrollLeft + ulWidth) > (ulWidth)) {
                $(object).parents().children(".sf-js-carousel-inner").animate({
                    scrollLeft: '-=' + itemWidth
                }, duration);
            }
        }
    }

    function scrollTermsElements(object, addValue, scrollValue, duration, isResized) {

        if ($(object).parents().children(".sf-js-terms-wrap-inner-main:animated").length) {
            return false;
        }

        var leftArrow = $(object).parents().find(".sf-js-terms-wrap-inner .leftArrow_SF_CAL");
        var rightArrow = $(object).parents().find(".sf-js-terms-wrap-inner .rightArrow_SF_CAL ");

        var inner_main = $(object).parents().children(".sf-js-terms-wrap-inner-main")[0];
        var child_element = $(inner_main).find('ul').children('.termInterest_SF_CAL');
        var scrollWidth = $(inner_main).scrollWidth;

        var ulWidth = $(inner_main).width();
        var elemScrollLeft = $(inner_main).scrollLeft();

        var firstChild = $(inner_main).offset().left;
        var firstChildOffset = $(inner_main).find("ul li:first-child").offset().left;

        var itemWidth = $($(child_element)[0]).outerWidth();
        var liItems = $(child_element).length;

        var maxElementwidth = $(inner_main).find('ul').attr("maxelemwidth");
        var maxScrollWidth = $(inner_main).find('ul').attr("elemscroll");

        if (typeof addValue != "undefined" && addValue) {
            if (((elemScrollLeft + ulWidth + 10)) < ((liItems * itemWidth))) {
                $(object).parents().children(".sf-js-terms-wrap-inner-main").animate({
                    scrollLeft: '+=' + itemWidth
                }, duration, function () {

                    var scrollLeft = parseInt($(object).parents().children(".sf-js-terms-wrap-inner-main").scrollLeft());

                    if (scrollLeft > maxScrollWidth) {
                        var diff = scrollLeft - maxScrollWidth;
                        scrollLeft = scrollLeft - diff;
                    }
                    console.log("maxScrollWidth right", maxScrollWidth);
                    if (maxScrollWidth == scrollLeft)
                        $(rightArrow).addClass("disabled");
                    if (maxScrollWidth != scrollLeft)
                        $(rightArrow).removeClass("disabled");
                    if (scrollLeft != 0)
                        $(leftArrow).removeClass("disabled");
                    if (scrollLeft == 0)
                        $(leftArrow).addClass("disabled");
                });
            }
        } else {
            if ((elemScrollLeft + ulWidth) > (ulWidth)) {
                $(object).parents().children(".sf-js-terms-wrap-inner-main").animate({
                    scrollLeft: '-=' + itemWidth
                }, duration, function () {
                    var scrollLeft = parseInt($(object).parents().children(".sf-js-terms-wrap-inner-main").scrollLeft());
                    if (scrollLeft > maxScrollWidth) {
                        var diff = scrollLeft - maxScrollWidth;
                        scrollLeft = scrollLeft - diff;
                    }
                    console.log("maxScrollWidth left", maxScrollWidth);
                    if (maxScrollWidth == scrollLeft)
                        $(rightArrow).addClass("disabled");
                    if (maxScrollWidth != scrollLeft)
                        $(rightArrow).removeClass("disabled");
                    if (scrollLeft != 0)
                        $(leftArrow).removeClass("disabled");
                    if (scrollLeft == 0)
                        $(leftArrow).addClass("disabled");
                });
            }
        }
    }

    function swapDefaultSelectedTab(parent) {
        var element = null;
        var needToMove = false;
        $(parent).children().each(function (index) {
            if (index > 0) {
                if ($(this).hasClass("active")) {
                    needToMove = true;
                    element = this;
                    $(this).remove();
                    return;
                }
            }
        });
        if (needToMove) {
            $(parent).prepend(element);
            if (typeof element != "undefined" && element != null) {
                constructPopOverEventBinding($(element).find(".bmw-i-icon"), sfElementObject);
            }
        }
    }
    function constructTabs(parent, reference, tabType) {

        var type = reference.selectedSubProductDetails['defaultType'];
        var index = reference.selectedSubProductDetails['defaultIndex'];

        for (var i = 0; i < reference.subProducts[tabType].length; i++) {
            var tabElement = $('<li class="sfProductTab_SF_CAL ' + ((type == tabType && i == index) ? 'active' : '') +
                ' tabs_SF_CAL" target="' + tabType +
                '" startDate="' + reference.subProducts[tabType][i]["SUBPROD_START_DATE"] +
                '" endDate="' + reference.subProducts[tabType][i]["SUBPROD_END_DATE"] +
                '" subproductId="' + reference.subProducts[tabType][i]["SUBPROD_ID"] +
                '" subproductInternalId="' + reference.subProducts[tabType][i]["SUBPROD_INTERNAL_ID"] + '" index="' + i + '"></li>');

            var subMain = $('<div class="sf-js-sub-main"></div>');
            var carousel_title = $('<div class="sf-js-carousel-title">');
            var iconImage = $('<a href="javascript:void(0);" class="bmw-i-icon">&#1110;</a>');

            $(carousel_title).append('<h2>' + reference.subProducts[tabType][i]["SUBPROD_NAME"] + '</h2>');
            $(carousel_title).append(iconImage);
            $(subMain).append(carousel_title);
            $(tabElement).append(subMain);
            $(tabElement).append('<div class="sf-js-short-desc">' +
                '<p>' + reference.subProducts[tabType][i]["SUBPROD_SHORT_DESC"] + '</p>' +
                '</div>' + '<div class="sf-js-li-border"></div></div>');
            $(parent).append(tabElement);
            $(tabElement).wrapInner('<div class="sf-js-li-main"></div>');

            constructPopOverEventBinding(iconImage, reference);
            $(reference).on("click", function () {
                if (navigator.platform == "iPad" || navigator.platform == "iPhone")
                    if ($(this).find(".sf-cal-js-popover").length != 0) {
                        $(this).find(".sf-cal-js-popover").remove();
                    }
            });
        }
    }
    function constructPopOverEventBinding(iconImage, reference) {
        $(iconImage).on("click mouseover", $(this), function () {
            $(this).parents(".sf-js-carousel-main").parent().find(".sf-cal-js-popover").remove();
            var target = $(this).parents(".sf-js-li-main").parent().attr("target");
            var index = $(this).parents(".sf-js-li-main").parent().attr("index");
            var p = $(this).offset();
            var parentOffset = $(this).parents(".sf-js-carousel-main").offset();
            var popImage = '<img src="' + RESOURCE_PATH + '/' + staticDataFromXML["img"][reference.subProducts[target][index]["DEFAULT_PAYMENT_TYPE"]] + '" alt="Img"/>';
            var popupElement = $('<div class="sf-cal-js-popover bottom in"><div class="sf-cal-js-arrow" style="left: 103px;"></div><div class="sf-cal-js-popover-inner"><h3 class="sf-cal-js-popover-title">' + reference.subProducts[target][index]["SUBPROD_NAME"] + '</h3><div class="sf-cal-js-popover-content">' + popImage + '<p>' + reference.subProducts[target][index]["SUBPROD_LONG_DESC"] + '</p></div></div></div>');
            $(popupElement).insertAfter($(this).parents(".sf-js-carousel-main"));
            if ($(reference).outerWidth(true) < 600) {
                $(popupElement).css("top", (p.top - parentOffset.top + 36) + "px");
            }
            else
                $(popupElement).css("top", (p.top - parentOffset.top + 40) + "px");
            var popoverLeftPosition = (p.left - parentOffset.left - ($(popupElement).outerWidth() / 2) + 6);
            $(popupElement).css("left", popoverLeftPosition + "px");
            var mainElementOffset = $(this).parents(".sf-js-carousel-main").offset();
            if ((mainElementOffset.left + $(this).parents(".sf-js-carousel-main").outerWidth(true)) < ($(popupElement).offset().left + $(popupElement).outerWidth(true))) {
                var diffrerence = ($(popupElement).offset().left + $(popupElement).outerWidth(true)) - (mainElementOffset.left + $(this).parents(".sf-js-carousel-main").outerWidth(true));
                $(popupElement).css("left", (popoverLeftPosition - diffrerence) + "px");
                var arrowLeft = $(popupElement).children(".sf-cal-js-arrow").css("left");
                arrowLeft = parseFloat(arrowLeft.substring(0, arrowLeft.length - 2));
                $(popupElement).children(".sf-cal-js-arrow").css("left", (arrowLeft + diffrerence) + 'px');
            }
            $(popupElement).on("mouseleave", function () {
                $(this).remove();
            });
        });
        $(iconImage).parents(".sfProductTab_SF_CAL").on("mouseleave", function (ref) {
            if (ref.originalEvent.pageY <= $(this).offset().top ||
                ref.originalEvent.pageX <= $(this).offset().left) {
                $(this).parents(".sf-js-carousel-main").parent().find(".sf-cal-js-popover").remove();
            }
            else
                if ($(window).width() < 1100) {
                    $(this).parents(".sf-js-carousel-main").parent().find(".sf-cal-js-popover").remove();
                }
        });
    }
    function showTabElement(obj, reference) {
        $(obj).parent().children().each(function () {
            $(this).removeClass("active");
        });
        $(obj).addClass("active");

        var parent = showOrHideTabContent($(obj).attr("subproductid"), $(obj).attr("subproductinternalid"), reference);

        reference.selectedSubProductDetails['subProductId'] = $(obj).attr("subproductid");
        reference.selectedSubProductDetails['subProductInternalId'] = $(obj).attr("subproductinternalid");
        reference.selectedSubProductDetails['defaultIndex'] = $(obj).attr("index");
        reference.selectedSubProductDetails['defaultType'] = $(obj).attr("target");

        if ($(parent).children().length == 0) {
            if ($(obj).attr("target") == BALLOON_TAB &&
                typeof reference.subProducts[BALLOON_TAB][$(obj).attr("index")]['PRODUCT_BALLOON_MATRIX_ID'] != "undefined" &&
                typeof reference.subProducts[BALLOON_TAB][$(obj).attr("index")]["BALLOONLIST"] == "undefined") {
                var inputData = {
                    "reference": reference,
                    "parent": parent,
                    "index": $(obj).attr("index")
                };
                var INT12URL = HOST_URL + INT12 + "/" + reference.marketID + "/" + reference.data["CHANNEL_ID"] + "/" +
                    reference.subProducts[BALLOON_TAB][$(obj).attr("index")]['SUBPROD_ID'] + "/" +
                    reference.subProducts[BALLOON_TAB][$(obj).attr("index")]['PRODUCT_BALLOON_MATRIX_ID'] + "/" + reference.data["AG_VG_CODE"];
                initiateAjaxCall(null, INT12URL,
                    function (response, referenceObject) {
                        referenceObject["reference"].subProducts[BALLOON_TAB][referenceObject["index"]]["BALLOONLIST"] = response["BALLOONLIST"];
                        constructIntialLoad(referenceObject["parent"], referenceObject["reference"]);
                    }, inputData, sfElementObject);
            } else {
                constructIntialLoad(parent, reference);
            }
        }
    }

    function constructIntialLoad(parent, reference, details) {
        var INT14_RQ_BODY = {
            "MARKET_ID": reference.marketID,
            "CHANNEL_ID": reference.data["CHANNEL_ID"],
            "BRAND": reference.data["THEME_ID"],
            "VEHICLE_STATUS": reference.data["VEHICLE_STATUS"],
            "CUSTOMER_TYPE": reference.data["CUSTOMER_TYPE"],
            "AG_VG_CODE": reference.data["AG_VG_CODE"],
            "MSRP": reference.data["MSRP"],
            "SUBPROD_ID": '',
            "SUBPROD_INTERNAL_ID": '',
            "DOWN_PAYMENT_PCT": ''
        };
        var inputData = {
            "root": null,
            "type": null,
            'minPCT': '',
            'maxPCT': '',
            'defaultPCT': '',
            'bal_minPCT': '',
            'bal_maxPCT': '',
            'default_balPCT': '',
            'bon_minPCT': '',
            'bon_maxPCT': '',
            'default_bonPCT': '',
            'sd_minPCT': '',
            'sd_maxPCT': '',
            'default_sdPCT': '',
            'defaultTerm': '',
            'defaultChecked': '',
            'parent': parent,
            "MSRP": reference.data["MSRP"],
            "MARKET_ID": reference.marketID,
            'SUBPROD_ID': '',
            'SUBPROD_INTERNAL_ID': '',
            'ROOT_ELEMENT': reference,
            'IS_INITIAL': !isAvailable(details)
        };
        var type = reference.selectedSubProductDetails['defaultType'];
        var index = reference.selectedSubProductDetails['defaultIndex'];
        var purchaseList = reference.subProducts[type][index]["ASSOCLIST"];
        var purchaseListArray = [];
        if (isAvailable(purchaseList)) {
            for (var pi = 0; pi < purchaseList.length; pi++) {
                purchaseListArray.push(purchaseList[pi]["ASSOCIATE_SERVICE_ID"]);
            }
        }
        if ((purchaseListArray.indexOf("AS00004")) != -1)
            reference.showPurchaseTax = true;
        if (isAvailable(reference.data["PURCHASE_TAX"]) && reference.showPurchaseTax) {
            INT14_RQ_BODY["PURCHASE_TAX"] = reference.data["PURCHASE_TAX"];
        }
        reference.showPurchaseTax = false;
        if (typeof details == "undefined" || details == null) {
            INT14_RQ_BODY["SUBPROD_ID"] = reference.subProducts[type][index]["SUBPROD_ID"];
            INT14_RQ_BODY["SUBPROD_INTERNAL_ID"] = reference.subProducts[type][index]["SUBPROD_INTERNAL_ID"];
            INT14_RQ_BODY["DOWN_PAYMENT_PCT"] = isAvailable(reference["data"]["DOWN_PAYMENT_PCT"]) ? reference["data"]["DOWN_PAYMENT_PCT"] : reference.subProducts[type][index]["DEFAULT_DOWN_PAY_PCT"];
            var minDPM_PCT = reference.subProducts[type][index]["MIN_DOWN_PAY_PCT"];
            if (isAvailable(reference.customerType) && reference.customerType == 'Corporate') {
                if (isAvailable(reference.subProducts[type][index]["MIN_DOWN_PAY_PCT_CORP"]))
                    minDPM_PCT = reference.subProducts[type][index]["MIN_DOWN_PAY_PCT_CORP"];
            }
            inputData['minPCT'] = minDPM_PCT;
            inputData['maxPCT'] = reference.subProducts[type][index]["MAX_DOWN_PAY_PCT"];
            inputData['defaultPCT'] = reference.subProducts[type][index]["DEFAULT_DOWN_PAY_PCT"];
            inputData['defaultTerm'] = reference.subProducts[type][index]["DEFAULT_TERM"];
            inputData['SUBPROD_ID'] = reference.subProducts[type][index]["SUBPROD_ID"];
            inputData['SUBPROD_INTERNAL_ID'] = reference.subProducts[type][index]["SUBPROD_INTERNAL_ID"];
            inputData['defaultChecked'] = "";
            if (type == BALLOON_TAB) {
                if (typeof reference.subProducts[type][index]['BALLOONLIST'] != "undefined") {
                    var found = false,
                        indexFound = -1;
                    var bmin = -1, bmax = -1, AG_VG_CODE = null;
                    for (var k = 0; k < reference.subProducts[type][index]['BALLOONLIST'].length; k++) {
                        var from = reference.subProducts[type][index]['BALLOONLIST'][k]['BALLOON_FROM_TERM'];
                        var to = reference.subProducts[type][index]['BALLOONLIST'][k]['BALLOON_TO_TERM'];
                        if (!found && reference.subProducts[type][index]["DEFAULT_TERM"] >= from &&
                            reference.subProducts[type][index]["DEFAULT_TERM"] <= to) {
                            indexFound = k;
                            found = true;
                        }
                        if (AG_VG_CODE == null)
                            AG_VG_CODE = reference.subProducts[type][index]['BALLOONLIST'][k]["AG_VG_CODE"];

                        if (AG_VG_CODE == reference.subProducts[type][index]['BALLOONLIST'][k]["AG_VG_CODE"]) {
                            if (bmin == -1)
                                bmin = reference.subProducts[type][index]['BALLOONLIST'][k]["MIN_BALLOON_PCT"];
                            else
                                if (bmin > reference.subProducts[type][index]['BALLOONLIST'][k]["MIN_BALLOON_PCT"])
                                    bmin = reference.subProducts[type][index]['BALLOONLIST'][k]["MIN_BALLOON_PCT"];
                            if (bmax == -1)
                                bmax = reference.subProducts[type][index]['BALLOONLIST'][k]["MAX_BALLOON_PCT"];
                            else
                                if (bmax < reference.subProducts[type][index]['BALLOONLIST'][k]["MAX_BALLOON_PCT"])
                                    bmax = reference.subProducts[type][index]['BALLOONLIST'][k]["MAX_BALLOON_PCT"];
                        }
                    }
                    if (found) {
                        inputData['balloonDataFound'] = true;
                        inputData['bal_minPCT'] = bmin; //reference.subProducts[type][index]['BALLOONLIST'][indexFound]['MIN_BALLOON_PCT'];
                        inputData['bal_maxPCT'] = bmax; //reference.subProducts[type][index]['BALLOONLIST'][indexFound]['MAX_BALLOON_PCT'];
                        inputData['default_balPCT'] = reference.subProducts[type][index]['BALLOONLIST'][indexFound]['DEFAULT_BALLOON_PCT'];
                        INT14_RQ_BODY["BALLOON_PCT"] = isAvailable(reference["data"]["BALLOON_PCT"]) ? reference["data"]["BALLOON_PCT"] : reference.subProducts[type][index]['BALLOONLIST'][indexFound]['DEFAULT_BALLOON_PCT'];
                    } else {
                        inputData['balloonDataFound'] = false;
                        inputData['bal_minPCT'] = 0;
                        inputData['bal_maxPCT'] = 0;
                        inputData['default_balPCT'] = 0;
                        INT14_RQ_BODY["BALLOON_PCT"] = 0;
                    }
                } else {
                    inputData['balloonDataFound'] = true;
                    INT14_RQ_BODY["BALLOON_PCT"] = isAvailable(reference["data"]["BALLOON_PCT"]) ? reference["data"]["BALLOON_PCT"] : reference.subProducts[type][index]["DEFAULT_BALLOON_PCT"];
                    inputData['bal_minPCT'] = reference.subProducts[type][index]["MIN_BALLOON_PCT"];
                    inputData['bal_maxPCT'] = reference.subProducts[type][index]["MAX_BALLOON_PCT"];
                    inputData['default_balPCT'] = reference.subProducts[type][index]["DEFAULT_BALLOON_PCT"];
                }
            }
            if (type == BONUS_TAB) {

                inputData['bon_minPCT'] = reference.subProducts[type][index]["MIN_BULLET_PAYMENT_VALUE"];
                inputData['bon_maxPCT'] = reference.subProducts[type][index]["MAX_BULLET_PAYMENT_VALUE"];
                inputData['default_bonPCT'] = reference.subProducts[type][index]["DEFAULT_BULLET_PAYMENT_VALUE"];
                var dpAmt = ((reference.data["MSRP"])) * ((INT14_RQ_BODY["DOWN_PAYMENT_PCT"]));
                var financeAmount = ((reference.data["MSRP"]) - (dpAmt / 100)).toFixed(2);
                var inputBonusPct = parseFloat((reference.data["BONUS_AMT"] * 100) / (parseFloat(financeAmount)));
                INT14_RQ_BODY["BONUS_PCT"] = isAvailable(reference["data"]["BONUS_PCT_DATA"]) ? inputBonusPct : reference.subProducts[type][index]["DEFAULT_BULLET_PAYMENT_VALUE"];
            }
            if (type == STEPDOWN_TAB) {
                INT14_RQ_BODY["STEPDOWN_PCT"] = isAvailable(reference["data"]["STEPDOWN_PCT"]) ? reference["data"]["STEPDOWN_PCT"] : reference.subProducts[type][index]["DEFAULT_STEP_DOWN_PCT"];
                inputData['sd_minPCT'] = reference.subProducts[type][index]["MIN_STEP_DOWN_PCT"];
                inputData['sd_maxPCT'] = reference.subProducts[type][index]["MAX_STEP_DOWN_PCT"];
                inputData['default_sdPCT'] = reference.subProducts[type][index]["DEFAULT_STEP_DOWN_PCT"];
            }
        } else {
            INT14_RQ_BODY["SUBPROD_ID"] = details["SUBPROD_ID"];
            INT14_RQ_BODY["SUBPROD_INTERNAL_ID"] = details["SUBPROD_INTERNAL_ID"];
            INT14_RQ_BODY["DOWN_PAYMENT_PCT"] = details["DEFAULT_DOWN_PAY_PCT"];
            var minDPM_PCT = details["MIN_DOWN_PAY_PCT"];
            if (isAvailable(reference.customerType) && reference.customerType == 'Corporate') {
                if (isAvailable(reference.subProducts[type][index]["MIN_DOWN_PAY_PCT_CORP"]))
                    minDPM_PCT = reference.subProducts[type][index]["MIN_DOWN_PAY_PCT_CORP"];
            }
            inputData['minPCT'] = minDPM_PCT;
            inputData['maxPCT'] = details["MAX_DOWN_PAY_PCT"];
            inputData['defaultPCT'] = details["DEFAULT_DOWN_PAY_PCT"];
            inputData['defaultTerm'] = details["DEFAULT_TERM"];
            inputData['SUBPROD_ID'] = details["SUBPROD_ID"];
            inputData['SUBPROD_INTERNAL_ID'] = details["SUBPROD_INTERNAL_ID"];
            inputData['defaultChecked'] = details["DEFAULT_CHECK"];
            if (type == BALLOON_TAB) {
                INT14_RQ_BODY["BALLOON_PCT"] = details["DEFAULT_BALLOON_PCT"];
                inputData['bal_minPCT'] = details["MIN_BALLOON_PCT"];
                inputData['bal_maxPCT'] = details["MAX_BALLOON_PCT"];
                inputData['default_balPCT'] = details["DEFAULT_BALLOON_PCT"];
            }
            if (type == BONUS_TAB) {
                INT14_RQ_BODY["BONUS_PCT"] = details["DEFAULT_BULLET_PAYMENT_VALUE"];
                inputData['bon_minPCT'] = details["MIN_BULLET_PAYMENT_VALUE"];
                inputData['bon_maxPCT'] = details["MAX_BULLET_PAYMENT_VALUE"];
                inputData['default_bonPCT'] = details["DEFAULT_BULLET_PAYMENT_VALUE"];
            }
            if (type == STEPDOWN_TAB) {
                INT14_RQ_BODY["STEPDOWN_PCT"] = details["DEFAULT_STEP_DOWN_PCT"];
                inputData['sd_minPCT'] = details["MIN_STEP_DOWN_PCT"];
                inputData['sd_maxPCT'] = details["MAX_STEP_DOWN_PCT"];
                inputData['default_sdPCT'] = details["DEFAULT_STEP_DOWN_PCT"];
            }
        }
        inputData["root"] = reference;
        inputData["type"] = type;
        reference.inputData = inputData;
        initiateAjaxCall(JSON.stringify(INT14_RQ_BODY),
            HOST_URL + INT14, reference.int14ResponseHandle, inputData, sfElementObject);
    }

    function getAvailableInfo(data, reference) {
        return (data[reference] != 'undefined' && data[reference] != null && data[reference].trim() != '');
    }

    function getTabContentUI(details) {
        var monthlyInstallment = null;
        var defaultTermAvailable = false;
        var defaultTerm = details['referenceData']['defaultTerm'];
        var defaultTermIndex = 0;
        if (isAvailable(defaultTerm)) {
            for (var i = 0; i < details['terms'].length; i++) {
                if ((details['terms'][i]['term'] == defaultTerm) &&
                    (details['terms'][i]['CALCULATION_TYPE'] == 'CALEX'))
                    defaultTermIndex = i;
            }
        }
        var tempTerm = -1;
        if (isAvailable(details['rootElementRef'].data['TERM'])) {
            var term = 0;
            for (var i = 0; i < details['terms'].length; i++) {
                if ((details['terms'][i]['term'] == details['rootElementRef'].data['TERM']) &&
                    (details['terms'][i]['CALCULATION_TYPE'] == 'CALEX')) {
                    tempTerm = i;
                    term = details['terms'][i]['term'];
                }
            }
            if (tempTerm == -1) {
                $(details['referenceData']['root']).append(sfLoadErrorMsg(staticDataFromXML[details['referenceData']['MARKET_ID']]['REQUEST_TERM_NOT_AVAILABLE']));
            } else {
                defaultTermIndex = tempTerm;
                defaultTerm = term;
                details['terms'][defaultTermIndex]['term'] = defaultTerm;
                details['referenceData']['defaultTerm'] = defaultTerm;
            }
        }
        if (!details['rootElementRef'].interestRateChecked) {
            details['rootElementRef'].interestRateChecked = true;
            if (isAvailable(details['rootElementRef'].data['INTEREST_RATE']) &&
                details['rootElementRef'].data['INTEREST_RATE'] != details['terms'][defaultTermIndex]['interestRate']) {
                $(details['referenceData']['root']).append(sfLoadErrorMsg(staticDataFromXML[details['referenceData']['MARKET_ID']]['INTEREST_RATE_CHANGED']));
            } else {
                console.log('Interest rate matched...');
            }
        }
        if (details['type'] == STEPDOWN_TAB) {
            monthlyInstallment = $('<div class="col-xs-12_SF_CAL stepDownInstallments_SF_CAL"></div>');
            $(monthlyInstallment).append(getStepDownMonthlyInstallmentUI(details['terms'][defaultTermIndex]['SFProductStepDownMonthlyInstallment']));
        } else {
            details['terms'][defaultTermIndex]['installment'] = formatCurrency(details['terms'][defaultTermIndex]['installment']);
            monthlyInstallment = $('<div class="col-xs-12_SF_CAL amtMonthly_SF_CAL"></div>');
            $(monthlyInstallment).append('<div class="installmentDetails_SF_CAL">' +
                '<div class="name_SF_CAL">' +
                '<span class="header_SF_CAL">' + staticDataFromXML[details['referenceData']['MARKET_ID']]['MONTHLY_INSTALLMENT_AMOUNT'] + ':</span></div>' +
                '<div class="price_SF_CAL"><span class="SFamount_SF_CAL"><span>&#65509;</span>' +
                '<span class="SFamount_monthlyInstallment_SF_CAL">' +
                details['terms'][defaultTermIndex]['installment'] + '</span>' +
                '</div>' +
                '<div class="sf-js-clearfix"></div></div>');
        }
        $(details['referenceData']['parent']).append(monthlyInstallment);
        var rangeStart = 0,
            rangeEnd = 0;
        rangeStart = ((details['referenceData']['MSRP'] * details['referenceData']['minPCT']) / 100);
        rangeEnd = ((details['referenceData']['MSRP'] * details['referenceData']['maxPCT']) / 100);
        $(details['referenceData']['parent']).append(getAmountMinMaxUI({
            'title': staticDataFromXML[details['referenceData']['MARKET_ID']]['DOWN_PAYMENT'],
            'amount': details['terms'][defaultTermIndex]['downPayment'],
            'minPCT': details['referenceData']['minPCT'],
            'maxPCT': details['referenceData']['maxPCT'],
            'defaultPCT': details['referenceData']['defaultPCT'],
            'referenceData': details['referenceData'],
            'parentClass': NORMAL_TAB + '_inputParent'
        }));
        switch (details['type']) {
            case NORMAL_TAB:
                break;
            case BALLOON_TAB:
                $(details['referenceData']['parent']).append(getAmountMinMaxUI({
                    'title': staticDataFromXML[details['referenceData']['MARKET_ID']]['BALLON_AMOUNT'],
                    'amount': details['terms'][defaultTermIndex]['balloonAmount'],
                    'minPCT': details['referenceData']['bal_minPCT'],
                    'maxPCT': details['referenceData']['bal_maxPCT'],
                    'defaultPCT': details['referenceData']['default_balPCT'],
                    'referenceData': details['referenceData'],
                    'parentClass': BALLOON_TAB + '_inputParent'
                }));
                break;
            case BONUS_TAB:
                $(details['referenceData']['parent']).append(getAmountMinMaxUI({
                    'title': staticDataFromXML[details['referenceData']['MARKET_ID']]['BONUS_AMOUNT'],
                    'amount': details['terms'][defaultTermIndex]['yearlyPayment'],
                    'minPCT': details['referenceData']['bon_minPCT'],
                    'maxPCT': details['referenceData']['bon_maxPCT'],
                    'defaultPCT': details['referenceData']['default_bonPCT'],
                    'referenceData': details['referenceData'],
                    'parentClass': BONUS_TAB + '_inputParent'
                }));
                break;
            case STEPDOWN_TAB:
                $(details['referenceData']['parent']).append(getAmountMinMaxUI({
                    'title': staticDataFromXML[details['referenceData']['MARKET_ID']]['YEARLY_PAYMENT_AMOUNT'],
                    'amount': details['terms'][defaultTermIndex]['yearlyPayment'],
                    'minPCT': details['referenceData']['sd_minPCT'],
                    'maxPCT': details['referenceData']['sd_maxPCT'],
                    'defaultPCT': details['referenceData']['default_sdPCT'],
                    'referenceData': details['referenceData'],
                    'parentClass': STEPDOWN_TAB + '_inputParent'
                }));
                break;
        }
        var selectedType = details['rootElementRef'].selectedSubProductDetails['defaultType'];
        var selectedIndex = details['rootElementRef'].selectedSubProductDetails['defaultIndex'];
        var selectedReference = details['rootElementRef'].subProducts[selectedType][selectedIndex];
        var puchaseTaxVisibility = details['referenceData']['root']['data']['PURCHASE_TAX_VISIBILITY'];
        details['referenceData']['parent'].append(getTermsUI(details));
        var tabsContainer = details['referenceData']['parent'].find(".sf-js-terms-wrap-inner-main").find("ul");
        var liContainerWidth = details['referenceData']['parent'].find(".sf-js-terms-wrap-inner-main").width();
        var mainContainer = details['referenceData']['parent'].parents().find(".topParent_SF_CAL").width();
        var termsListWrap = details['referenceData']['parent'].find(".sf-js-terms-wrap-inner-main");

        if (mainContainer > 200 && mainContainer < 640) {
            $(tabsContainer).children('li').outerWidth(parseInt(liContainerWidth / 2));
        }
        else if (mainContainer > 641 && mainContainer < 880) {
            $(tabsContainer).children('li').outerWidth(parseInt(liContainerWidth / 3));
        }
        else {
            $(tabsContainer).children('li').outerWidth(parseInt(liContainerWidth / 4));
        }
        var maxElementwidth = ($(tabsContainer).children('.termInterest_SF_CAL').length) * ($(tabsContainer).children('.termInterest_SF_CAL').outerWidth());
        var scrollWidth = maxElementwidth - $(termsListWrap).outerWidth();
        var lastPos = 0;
        var scrollLeft = 0;
        $(tabsContainer).attr('maxelemwidth', parseInt(maxElementwidth));
        $(tabsContainer).attr('elemscroll', scrollWidth);
        if (liContainerWidth >= ($(tabsContainer).children(".termInterest_SF_CAL").length) * ($(tabsContainer).children(".termInterest_SF_CAL").outerWidth()))
            $(termsListWrap).parents().children(".sf-js-terms-wrap-inner .rightArrow_SF_CAL").addClass("disabled");

        var buttonHeight = $(details['referenceData']['parent']).find('.termInterest_SF_CAL').height();

        $(details['referenceData']['parent']).find('.sf-js-terms-button').height(buttonHeight);

        if (typeof selectedReference['ASSOCLIST'] != "undefined" && selectedReference['ASSOCLIST'] != null) {
            details['referenceData']['parent'].append(getPurchaseDetails(selectedReference['ASSOCLIST'], puchaseTaxVisibility, details['referenceData']));
        } else {
            details['referenceData']['parent'].append(getPurchaseDetails("", puchaseTaxVisibility, details['referenceData']));

        }
        if (typeof selectedReference['SUBPROD_CONDITION_DESC'] != "undefined" && selectedReference['SUBPROD_CONDITION_DESC'] != null)
            details['referenceData']['parent'].append(getConditionDescription(selectedReference['SUBPROD_CONDITION_DESC'], details['referenceData']));

        if (typeof selectedReference['SUBPROD_DISCLAIMER_DESC'] != "undefined" && selectedReference['SUBPROD_DISCLAIMER_DESC'] != null)
            details['referenceData']['parent'].append(getDisclaimerText(selectedReference['SUBPROD_DISCLAIMER_DESC'], details['referenceData']));

        details['referenceData']['parent'].append(bmwLinkText(selectedReference['SUBPROD_DISCLAIMER_DESC'], details['referenceData']));

        var msrp = details['rootElementRef'].data['MSRP'];
        var dpmt = details['rootElementRef'].data['DOWN_PAYMENT'];
        if (isAvailable(msrp)) {
            if (isAvailable(dpmt)) {
                if ((parseFloat(msrp) - parseFloat(dpmt)) < 100000) {
                    $(details['rootElementRef']).append(sfLoadErrorMsg(staticDataFromXML[details['referenceData']['MARKET_ID']]['DOWN_PAYMENT_BELOW'], selectedType));
                }
                else {
                    checkSFCalNotInRangeError(dpmt, rangeStart, rangeEnd, NORMAL_TAB, details);
                    refAmountCalcError(details, dpmt, selectedIndex, selectedType);
                }
            }
            else {
                var referenceAmount = 0;
                var selectedTab = details.referenceData.root.selectedSubProductDetails.defaultType;
                var selectedIndex = details.referenceData.root.selectedSubProductDetails.defaultIndex;
                refAmountCalcError(details, dpmt, selectedIndex, selectedTab);
            }
        }
    }
    function refAmountCalcError(details, dpmt, selectedIndex, selectedTab) {
        var referenceAmount = 0;
        var selectedTab = selectedTab;
        var selectedIndex = selectedIndex;
        if (details['type'] == STEPDOWN_TAB ||
            (details['type'] == BONUS_TAB && details['referenceData']["root"]["subProducts"][selectedTab][selectedIndex]["BULLET_PAYMENT_BASIS"] == "PBFIN")) {
            var dpValue_pct;
            if (isAvailable(dpmt))
                dpValue_pct = parseFloat((dpmt / details['referenceData']['MSRP']) * 100);
            else
                dpValue_pct = details['referenceData']['defaultPCT'];
            referenceAmount = parseFloat(details['referenceData']['MSRP']) - ((parseFloat(dpValue_pct) * parseFloat(details['referenceData']['MSRP'])) / 100);
        } else {
            referenceAmount = parseFloat(details['referenceData']['MSRP']);
        }
        switch (details['type']) {
            case BALLOON_TAB:
                if (isAvailable(details['rootElementRef'].data['BALLOON_AMT'])) {
                    checkSFCalNotInRangeError(details['rootElementRef'].data['BALLOON_AMT'],
                        ((parseFloat(referenceAmount) * parseFloat(details['referenceData']['bal_minPCT'])) / 100),
                        ((parseFloat(referenceAmount) * parseFloat(details['referenceData']['bal_maxPCT'])) / 100),
                        BALLOON_TAB, details);
                }
                break;
            case BONUS_TAB:
                if (isAvailable(details['rootElementRef'].data['BONUS_AMT'])) {
                    checkSFCalNotInRangeError(details['rootElementRef'].data['BONUS_AMT'],
                        parseInt(((parseFloat(referenceAmount) * parseFloat(details['referenceData']['bon_minPCT']))) / 100),
                        parseInt(((parseFloat(referenceAmount) * parseFloat(details['referenceData']['bon_maxPCT']))) / 100),
                        BONUS_TAB, details);
                }
                break;
            case STEPDOWN_TAB:
                if (isAvailable(details['rootElementRef'].data['STEPDOWN_PCT'])) {
                    checkSFCalNotInRangeError(((parseFloat(referenceAmount) * parseFloat(details['rootElementRef'].data['STEPDOWN_PCT'])) / 100),
                        ((parseFloat(referenceAmount) * parseFloat(details['referenceData']['sd_minPCT'])) / 100),
                        ((parseFloat(referenceAmount) * parseFloat(details['referenceData']['sd_maxPCT'])) / 100),
                        STEPDOWN_TAB, details);
                }
                break;
        }
    }
    function checkSFCalNotInRangeError(paymentReference, min, max, type, details) {
        if (parseFloat(paymentReference) < parseFloat(min) ||
            parseFloat(paymentReference) > parseFloat(max)) {
            switch (type) {
                case NORMAL_TAB:
                    $(details['rootElementRef']).append(
                        sfLoadErrorMsg(
                            staticDataFromXML[details['referenceData']['MARKET_ID']]['DOWN_PAYMENT_NOT_IN_RANGE'],
                            type));
                    break;
                case BALLOON_TAB:
                    $(details['rootElementRef']).append(
                        sfLoadErrorMsg(
                            staticDataFromXML[details['referenceData']['MARKET_ID']]['BALLON_PAYMENT_NOT_IN_RANGE'],
                            type));
                    break;
                case BONUS_TAB:
                    $(details['rootElementRef']).append(
                        sfLoadErrorMsg(
                            staticDataFromXML[details['referenceData']['MARKET_ID']]['BONUS_PAYMENT_NOT_IN_RANGE'],
                            type));
                    break;
                case STEPDOWN_TAB:
                    $(details['rootElementRef']).append(
                        sfLoadErrorMsg(
                            staticDataFromXML[details['referenceData']['MARKET_ID']]['STEPDOWN_PAYMENT_NOT_IN_RANGE'],
                            type));
                    break;
            }
        }

    }
    function getStepDownMonthlyInstallmentUI(installmentData) {
        var installmentDetails = $('<table class="installmentDetails_SF_CAL" cellpadding="10" style="width:auto;"></table>');
        for (var i = 0; i < installmentData.length; i++) {
            installmentData[i]['amount'] = formatCurrency(installmentData[i]['amount']);
            $(installmentDetails).append($('<tr class="year1_SF_CAL">' +
                '<td><span class="header_SF_CAL">' + installmentData[i]['title'] + ':</span></td>' +
                '<td><span class="SFamount_SF_CAL"><span>&#65509;</span><span class="stepdownyear_' + i + '">' + installmentData[i]['amount'] +
                '</span></span></span></td>' +
                '</tr>'));
        }
        return installmentDetails;
    }

    function decimalAdjust(type, value, exp) {
        // Shift        
        value = value.toString().split('e');
        value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
        // Shift back
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    }

    if (!Math.round10) {
        Math.round10 = function (value, exp) {
            return decimalAdjust('round', value, exp);
        };
    }

    if (!Math.floor10) {
        Math.floor10 = function (value, exp) {
            return decimalAdjust('floor', value, exp);
        };
    }

    // Decimal ceil
    if (!Math.ceil10) {
        Math.ceil10 = function (value, exp) {
            return decimalAdjust('ceil', value, exp);
        };
    }

    function getAmountMinMaxUI(data) {
        var decimalRegex = /^([1-9]\d*|0)(\.\d+)?$/;
        var decimalRoundVal = 0;
        var percentagedata = [];
        var amountArray = [];
        var payment = $('<div class="col-xs-12_SF_CAL paddingTop4_SF_CAL ' + data['parentClass'] + '" inputType="' + data['parentClass'] + '"></div>');
        $(payment).append('<span class="header_SF_CAL">' + data['title'] + ':</span>');
        var paymentFieldParent = $('<div class="row_SF_CAL SFPaymnet_SF_CAL paddingTop3_SF_CAL"></div>');
        var paymentInputFieldParent = $('<div class="col-xs-6_SF_CAL inputPadding_SF_CAL"></div>');
        var paymentInputField = $('<div class="select_SF_CAL "></div>');
        var PaymentDropdown = $('<select name="" class="amtInput_SF_CAL amtData_SF_CAL"></select>');
        var DropDownamtbutoon = $('<button class="drop_SF_CAL" target=""><div></div></button>');
        var referenceAmount = 0;
        var selectedTab = data.referenceData.root.selectedSubProductDetails.defaultType;
        var selectedIndex = data.referenceData.root.selectedSubProductDetails.defaultIndex;
        if (data['parentClass'] == (STEPDOWN_TAB + '_inputParent') ||
            (data['parentClass'] == (BONUS_TAB + '_inputParent') &&
                data["referenceData"]["root"]["subProducts"][selectedTab][selectedIndex]["BULLET_PAYMENT_BASIS"] == "PBFIN")) {
            var dpValue_pct = data['referenceData']['parent'].children("." + NORMAL_TAB + '_inputParent').
                find('.percData_SF_CAL').val();
            referenceAmount = parseFloat(data['referenceData']['MSRP']) - ((parseFloat(dpValue_pct) * parseFloat(data['referenceData']['MSRP'])) / 100);
        } else {
            referenceAmount = parseFloat(data['referenceData']['MSRP']);
        }
        var StartValue = ((referenceAmount * data['minPCT']) / 100);
        var EndValue = ((referenceAmount * data['maxPCT']) / 100);
        var min = parseFloat(data['minPCT']);
        var max = parseFloat(data['maxPCT']);
        if (min % 5 != 0) {
            percentagedata.push(min);
            min = Math.ceil(min / 5) * 5;
        }
        for (; min <= max; min += 5) {
            percentagedata.push(min);
        }
        if (max != (min - 5)) //if (max != (min - 5) && max <= 90)
            percentagedata.push(max);
        EndValue = ((referenceAmount * percentagedata[percentagedata.length - 1]) / 100);
        $.unique(percentagedata);
        var tempEndValue = (parseFloat(EndValue) + "").split(".")[0];
        var newData = StartValue;
        var pow = (tempEndValue.toString().length < 6) ? (tempEndValue.toString().length - 1) : (tempEndValue.toString().length - 2);
        var diffCal = (percentagedata.length < 8) ? ((EndValue - StartValue) / (percentagedata.length - 1)) : ((EndValue - StartValue) / 7);

        amountArray.push(StartValue);
        var valueDropdownLimit = (percentagedata.length < 8) ? (percentagedata.length - 1) : 7;

        for (var i = 1; i < valueDropdownLimit; i++) {
            newData = newData + diffCal;
            if (data['parentClass'] == BONUS_TAB + '_inputParent')
                amountArray.push(Math.round10(newData, pow));
            else
                amountArray.push(Math.floor10(newData, pow));
        }
        if (EndValue != 0) {
            amountArray.push(EndValue);
        }


        var calulatedValue = getSFCalFloatFixedPointValue(((referenceAmount * parseFloat(data['defaultPCT'])) / 100), 2);

        switch (data['parentClass']) {
            case NORMAL_TAB + '_inputParent':
                amountArray = getUpdatedDropdownList(data['referenceData']['root'].data['DOWN_PAYMENT'], amountArray, data['referenceData']['root']);
                if (data['referenceData']['IS_INITIAL'] &&
                    isAvailable(data['referenceData']['root'].data['DOWN_PAYMENT'])) {
                    data['defaultPCT'] = ((parseFloat(data['referenceData']['root'].data['DOWN_PAYMENT']) * 100) / referenceAmount);
                    percentagedata = getUpdatedDropdownPercentageList(data['defaultPCT'], percentagedata);
                    calulatedValue = getSFCalFloatFixedPointValue(parseFloat(data['referenceData']['root'].data['DOWN_PAYMENT']), 2);
                } else
                    if (!data['referenceData']['IS_INITIAL'] &&
                        isAvailable(data['referenceData']['root'].responseData['DOWN_PAYMENT'])) {
                        data['defaultPCT'] = ((parseFloat(data['referenceData']['root'].responseData['DOWN_PAYMENT']) * 100) / referenceAmount);
                        percentagedata = getUpdatedDropdownPercentageList(data['defaultPCT'], percentagedata);
                        calulatedValue = getSFCalFloatFixedPointValue(parseFloat(data['referenceData']['root'].responseData['DOWN_PAYMENT']), 2);
                    }
                break;
            case BALLOON_TAB + '_inputParent':
                amountArray = getUpdatedDropdownList(data['referenceData']['root'].data['BALLOON_AMT'], amountArray, data['referenceData']['root']);
                if (data['referenceData']['IS_INITIAL'] &&
                    isAvailable(data['referenceData']['root'].data['BALLOON_AMT'])) {
                    data['defaultPCT'] = ((parseFloat(data['referenceData']['root'].data['BALLOON_AMT']) * 100) / referenceAmount);
                    percentagedata = getUpdatedDropdownPercentageList(data['defaultPCT'], percentagedata);
                    calulatedValue = getSFCalFloatFixedPointValue(parseFloat(data['referenceData']['root'].data['BALLOON_AMT']), 2);
                }
                else
                    if (!data['referenceData']['IS_INITIAL'] &&
                        isAvailable(data['referenceData']['root'].responseData['BALLOON_AMT'])) {
                        data['defaultPCT'] = ((parseFloat(data['referenceData']['root'].responseData['BALLOON_AMT']) * 100) / referenceAmount);
                        percentagedata = getUpdatedDropdownPercentageList(data['defaultPCT'], percentagedata);
                        calulatedValue = getSFCalFloatFixedPointValue(parseFloat(data['referenceData']['root'].responseData['BALLOON_AMT']), 2);
                    }
                break;
            case BONUS_TAB + '_inputParent':
                amountArray = getUpdatedDropdownList(data['referenceData']['root'].data['BONUS_AMT'], amountArray, data['referenceData']['root']);
                if (data['referenceData']['IS_INITIAL'] &&
                    isAvailable(data['referenceData']['root'].data['BONUS_AMT'])) {
                    data['defaultPCT'] = ((parseFloat(data['referenceData']['root'].data['BONUS_AMT']) * 100) / referenceAmount);
                    percentagedata = getUpdatedDropdownPercentageList(data['defaultPCT'], percentagedata);
                    calulatedValue = getSFCalFloatFixedPointValue(parseFloat(data['referenceData']['root'].data['BONUS_AMT']), 2);
                }
                else
                    if (!data['referenceData']['IS_INITIAL'] &&
                        isAvailable(data['referenceData']['root'].responseData['BONUS_AMT'])) {
                        data['defaultPCT'] = ((parseFloat(data['referenceData']['root'].responseData['BONUS_AMT']) * 100) / referenceAmount);

                        if (decimalRegex.test(data['defaultPCT'])) {
                            decimalRoundVal = getSFCalFloatFixedPointValue(parseFloat(data['defaultPCT']), 2);//Math.round(data['defaultPCT']);
                        }
                        else {
                            decimalRoundVal = 0;
                            percentagedata = getUpdatedDropdownPercentageList(data['defaultPCT'], percentagedata);
                        }
                        calulatedValue = getSFCalFloatFixedPointValue(parseFloat(data['referenceData']['root'].responseData['BONUS_AMT']), 2);
                    }
                break;
            case STEPDOWN_TAB + '_inputParent':
                if (data['referenceData']['IS_INITIAL'] &&
                    isAvailable(data['referenceData']['root'].data['STEPDOWN_PCT'])) {
                    var sdPct = parseFloat(data['referenceData']['root'].data['STEPDOWN_PCT']);
                    calulatedValue = getSFCalFloatFixedPointValue(((referenceAmount * sdPct) / 100), 2);
                    percentagedata = getUpdatedDropdownPercentageList(sdPct, percentagedata);
                    amountArray = getUpdatedDropdownList(calulatedValue, amountArray, data['referenceData']['root']);
                    data['defaultPCT'] = sdPct;
                }
                else
                    if (!data['referenceData']['IS_INITIAL'] &&
                        isAvailable(data['referenceData']['root'].responseData['STEPDOWN_PCT'])) {
                        var sdPct = parseFloat(data['referenceData']['root'].responseData['STEPDOWN_PCT']);
                        calulatedValue = getSFCalFloatFixedPointValue(((referenceAmount * sdPct) / 100), 2);
                        percentagedata = getUpdatedDropdownPercentageList(sdPct, percentagedata);
                        amountArray = getUpdatedDropdownList(calulatedValue, amountArray, data['referenceData']['root']);
                        data['defaultPCT'] = sdPct;
                    }
                break;
        }
        $.unique(amountArray);
        if (data['parentClass'] != (STEPDOWN_TAB + '_inputParent')) {
            $(paymentInputField).append(PaymentDropdown);
            $(paymentInputField).append(DropDownamtbutoon);
            $(paymentInputFieldParent).append(paymentInputField);
            $(paymentFieldParent).append(paymentInputFieldParent);
        }

        var indexPosition = -1;
        if (indexPosition == -1) {
            for (var i = 0; i < amountArray.length - 1; i++) {
                if (calulatedValue > amountArray[i] && calulatedValue < amountArray[i + 1])
                    indexPosition = i + 1;
            }
        }
        if (indexPosition != -1) {
            amountArray.splice(indexPosition, 0, calulatedValue);
        }
        $.unique(amountArray);
        $(PaymentDropdown).empty();
        var amtArray = [];

        for (var i = 0; i < amountArray.length; i++) {
            if (data['parentClass'] == NORMAL_TAB + '_inputParent')
                if ((referenceAmount - amountArray[i]) < 100000) {
                    break;
                }
            var found = (amountArray[i] == calulatedValue);
            amountArray[i] = getLocaleAmountValue(amountArray[i]);
            $(PaymentDropdown).append($('<option value="' + amountArray[i] + '" class="amtInput_SF_CAL" ' + (found ? ' selected=true>' : '>') + "&#65509;" + amountArray[i].toString() + '</option>'));
        }

        var dropdownSection = $('<div class="col-xs-6_SF_CAL dropDown_SF_CAL"></div>');
        var dropdownParent = $('<div class="select_SF_CAL "></div>');
        var percentageDropdown = $('<select name="" class="amtInput_SF_CAL percData_SF_CAL"></select>');
        var DropDownButton = $('<button class="drop_SF_CAL" target=""><div></div></button>');

        $(dropdownParent).append(percentageDropdown);
        $(dropdownParent).append(DropDownButton);
        $(dropdownSection).append(dropdownParent);
        $(paymentFieldParent).append(dropdownSection);
        $(paymentFieldParent).append('<div class="sf-js-clearfix"></div>');
        $(payment).append(paymentFieldParent);
        var indexPosition = -1;
        if (indexPosition == -1) {
            for (var i = 0; i < percentagedata.length - 1; i++) {
                if (decimalRoundVal != 0) {
                    if (decimalRoundVal > percentagedata[i] && decimalRoundVal < percentagedata[i + 1]) {
                        indexPosition = i + 1;

                    }
                    decimalRoundVal = 0;
                }
                else {
                    var tempVal = data['defaultPCT'];
                    if (tempVal > percentagedata[i] && tempVal < percentagedata[i + 1])
                        indexPosition = i + 1;
                }

            }
        }
        if (indexPosition != -1) {
            percentagedata.splice(indexPosition, 0, data['defaultPCT']);
        }
        $.unique(percentagedata);
        $(percentageDropdown).empty();
        for (var i = 0; i < percentagedata.length; i++) {
            if (percentagedata[i] == data['defaultPCT']) {
                var dpCal = ((percentagedata[i] * referenceAmount) / 100);
                if (data['parentClass'] == NORMAL_TAB + '_inputParent')
                    if ((referenceAmount - dpCal) < 100000)
                        break;
                $(percentageDropdown).append($('<option value="' + percentagedata[i] + '" class="amtInput_SF_CAL" selected=true>' + getSFCalFloatFixedPointValue(parseFloat(percentagedata[i]), 2) + '%</option>'));
            }
            else {
                var dpCal = ((percentagedata[i] * referenceAmount) / 100);
                if (data['parentClass'] == NORMAL_TAB + '_inputParent')
                    if ((referenceAmount - dpCal) < 100000)
                        break;
                $(percentageDropdown).append($('<option value="' + percentagedata[i] + '" class="amtInput_SF_CAL">' + getSFCalFloatFixedPointValue(parseFloat(percentagedata[i]), 2) + '%</option>'));
            }
        }
        $(percentageDropdown).change(function () {
            var percentage = parseFloat($(this).val());
            percentagedata.push(percentage);
            $.unique(percentagedata);
            var result = ((referenceAmount * percentage) / 100);
            $(this).parents(".SFPaymnet_SF_CAL").children('.inputPadding_SF_CAL').
                find(".amtInput_SF_CAL").val(result);
            dropdownValueChange(data, this, result, percentage);
        });

        $(PaymentDropdown).change(function () {
            var result = $(this).val().replace(/[^0-9-. ]/g, '');
            data['defaultPCT'] = ((result * 100) / referenceAmount);
            dropdownValueChange(data, this, result, data['defaultPCT']);
        });

        if (data['parentClass'] == (NORMAL_TAB + '_inputParent') || data['parentClass'] == (BALLOON_TAB + '_inputParent')) {
            $(percentageDropdown).on('focusin touchend', function () {
                var selectedIsDownpayment = $(this).parents(".SFPaymnet_SF_CAL").parent().hasClass(NORMAL_TAB + '_inputParent');
                var selectedIsBalloon = $(this).parents(".SFPaymnet_SF_CAL").parent().hasClass(BALLOON_TAB + '_inputParent');
                if (selectedIsBalloon &&
                    $(this).parents(".SFPaymnet_SF_CAL").parent().prev().hasClass(NORMAL_TAB + '_inputParent')) {
                    var downPaymentParent = $(this).parents(".SFPaymnet_SF_CAL").parent().prev();
                    var selectedDownpaymentPercentage = parseFloat($(downPaymentParent).find(".dropDown_SF_CAL").find(".amtInput_SF_CAL").find(":selected").val());
                    changeDisableForNonComplianceData(
                        $(downPaymentParent).find(".dropDown_SF_CAL").find(".amtInput_SF_CAL"),
                        this, selectedDownpaymentPercentage, false);
                } else {
                    if (selectedIsDownpayment &&
                        $(this).parents(".SFPaymnet_SF_CAL").parent().next().hasClass(BALLOON_TAB + '_inputParent')) {
                        var balloonParent = $(this).parents(".SFPaymnet_SF_CAL").parent().next();
                        var selectedBalloonPercentage = parseFloat($(balloonParent).find(".dropDown_SF_CAL").find(".amtInput_SF_CAL").find(":selected").val());
                        changeDisableForNonComplianceData(
                            $(balloonParent).find(".dropDown_SF_CAL").find(".amtInput_SF_CAL"),
                            this, selectedBalloonPercentage, false);
                    }
                }
            });
            $(PaymentDropdown).on('focusin touchend', function () {
                var selectedIsDownpayment = $(this).parents(".SFPaymnet_SF_CAL").parent().hasClass(NORMAL_TAB + '_inputParent');
                var selectedIsBalloon = $(this).parents(".SFPaymnet_SF_CAL").parent().hasClass(BALLOON_TAB + '_inputParent');
                if (selectedIsBalloon &&
                    $(this).parents(".SFPaymnet_SF_CAL").parent().prev().hasClass(NORMAL_TAB + '_inputParent')) {
                    var downPaymentParent = $(this).parents(".SFPaymnet_SF_CAL").parent().prev();

                    var a = $(downPaymentParent).find(".inputPadding_SF_CAL").find(".amtInput_SF_CAL").find(":selected").val();
                    if (a != "" && a != null && a != undefined) {
                        var selectedDownpaymentAmount = parseInt($(downPaymentParent).find(".inputPadding_SF_CAL").find(".amtInput_SF_CAL").find(":selected").val().match(/\d*\.?\d*/g).join(""));

                        changeDisableForNonComplianceData(
                            $(downPaymentParent).find(".inputPadding_SF_CAL").find(".amtInput_SF_CAL"),
                            this, selectedDownpaymentAmount, true);
                    }
                } else {
                    if (selectedIsDownpayment &&
                        $(this).parents(".SFPaymnet_SF_CAL").parent().next().hasClass(BALLOON_TAB + '_inputParent')) {
                        var balloonParent = $(this).parents(".SFPaymnet_SF_CAL").parent().next();

                        var b = $(balloonParent).find(".inputPadding_SF_CAL").find(".amtInput_SF_CAL").find(":selected").val();
                        if (b != "" && b != null && b != undefined) {
                            var selectedBalloonAmount = parseInt($(balloonParent).find(".inputPadding_SF_CAL").find(".amtInput_SF_CAL").find(":selected").val().match(/\d*\.?\d*/g).join(""));
                            changeDisableForNonComplianceData(
                                $(balloonParent).find(".inputPadding_SF_CAL").find(".amtInput_SF_CAL"),
                                this, selectedBalloonAmount, true);
                        }
                    }
                }
            });
        }
        return payment;
    }
    function changeDisableForNonComplianceData(adjacent, current, selectedValue, isValueOption) {
        var msrp90Percent = ((parseFloat(sfElementObject.data["MSRP"]) * 90) / 100);
        $(adjacent).children().each(function () {
            $(this).prop("disabled", false);
        });
        $(current).children().each(function () {
            $(this).prop("disabled", false);
            if (isValueOption) {
                var eachValue = parseFloat($(this).val().match(/([0-9]*[.])?[0-9]+/g).join(""));
                if ((eachValue + selectedValue) > msrp90Percent)
                    $(this).prop("disabled", true);
            }
            else {
                var eachValue = parseFloat($(this).val());
                if ((eachValue + selectedValue) > 90)
                    $(this).prop("disabled", true);
            }
        });
    }

    function getLocaleAmountValue(amount) {
        var convertedAmount = formatCurrency(amount);
        convertedAmount = convertedAmount.toString().split(".");
        if ((parseInt(convertedAmount[1]) != 0) && (typeof convertedAmount[1] != "undefined"))
            return (convertedAmount[0] + "." + convertedAmount[1]);
        else
            return convertedAmount[0];
    }

    function dropdownValueChange(data, obj, result, percentage) {

        var sfPaymentReference = $(obj).parents(".SFPaymnet_SF_CAL");
        var currentElementParent = $(sfPaymentReference).parent();
        var currentInputType = $(currentElementParent).attr('inputType');

        var defaultTerm = data['referenceData']['defaultTerm'];

        $(data['referenceData']['parent']).find('.tabsInner_SF_CAL').children().each(function () {
            if ($(obj).hasClass('active')) {
                defaultTerm = $(obj).find('.termInterest_terms_SF_CAL').attr("selectedterm");
            }
        });
        var checkValue = $(data['referenceData']['parent']).find('.control-checkbox_SF_CAL').children('input')[0];
        if (!isNotVailable(checkValue))
            var defaultChecked = $(data['referenceData']['parent']).find('.control-checkbox_SF_CAL').children('input')[0].checked;
        var requestDetails = {
            'SUBPROD_ID': data['referenceData']['SUBPROD_ID'],
            'SUBPROD_INTERNAL_ID': data['referenceData']['SUBPROD_INTERNAL_ID'],
            'DEFAULT_DOWN_PAY_PCT': percentage,
            'DEFAULT_BALLOON_PCT': data['referenceData']['default_balPCT'],
            'DEFAULT_BULLET_PAYMENT_VALUE': data['referenceData']['default_bonPCT'],
            'DEFAULT_STEP_DOWN_PCT': data['referenceData']['default_sdPCT'],
            'MIN_DOWN_PAY_PCT': data['referenceData']['minPCT'],
            'MAX_DOWN_PAY_PCT': data['referenceData']['maxPCT'],
            'MIN_BALLOON_PCT': data['referenceData']['bal_minPCT'],
            'MAX_BALLOON_PCT': data['referenceData']['bal_maxPCT'],
            'MIN_BULLET_PAYMENT_VALUE': data['referenceData']['bon_minPCT'],
            'MAX_BULLET_PAYMENT_VALUE': data['referenceData']['bon_maxPCT'],
            'MIN_STEP_DOWN_PCT': data['referenceData']['sd_minPCT'],
            'MAX_STEP_DOWN_PCT': data['referenceData']['sd_maxPCT'],
            'DEFAULT_TERM': defaultTerm,
            'DEFAULT_CHECK': defaultChecked
        };
        switch (data['referenceData']['type']) {
            case NORMAL_TAB:
                requestDetails['DEFAULT_DOWN_PAY_PCT'] = percentage;
                break;
            case BALLOON_TAB:
                if (currentInputType == BALLOON_TAB + '_inputParent') {
                    requestDetails['DEFAULT_BALLOON_PCT'] = percentage;
                    requestDetails['DEFAULT_DOWN_PAY_PCT'] = $(currentElementParent).parent().children('.' + NORMAL_TAB + '_inputParent').
                        find('.dropDown_SF_CAL').find('.amtInput_SF_CAL').val();
                } else {
                    requestDetails['DEFAULT_DOWN_PAY_PCT'] = percentage;
                    requestDetails['DEFAULT_BALLOON_PCT'] = $(currentElementParent).parent().children('.' + BALLOON_TAB + '_inputParent').
                        find('.dropDown_SF_CAL').find('.amtInput_SF_CAL').val();
                }
                break;
            case BONUS_TAB:
                if (currentInputType == BONUS_TAB + '_inputParent') {
                    requestDetails['DEFAULT_BULLET_PAYMENT_VALUE'] = percentage;
                    requestDetails['DEFAULT_DOWN_PAY_PCT'] = $(currentElementParent).parent().children('.' + NORMAL_TAB + '_inputParent').
                        find('.dropDown_SF_CAL').find('.amtInput_SF_CAL').val();
                } else {
                    requestDetails['DEFAULT_DOWN_PAY_PCT'] = percentage;
                    requestDetails['DEFAULT_BULLET_PAYMENT_VALUE'] = $(currentElementParent).parent().children('.' + BONUS_TAB + '_inputParent').
                        find('.dropDown_SF_CAL').find('.amtInput_SF_CAL').val();
                }
                break;
            case STEPDOWN_TAB:
                if (currentInputType == STEPDOWN_TAB + '_inputParent') {
                    requestDetails['DEFAULT_STEP_DOWN_PCT'] = percentage;
                    requestDetails['DEFAULT_DOWN_PAY_PCT'] = $(currentElementParent).parent().children('.' + NORMAL_TAB + '_inputParent').
                        find('.dropDown_SF_CAL').find('.amtInput_SF_CAL').val();
                } else {
                    requestDetails['DEFAULT_DOWN_PAY_PCT'] = percentage;
                    requestDetails['DEFAULT_STEP_DOWN_PCT'] = $(currentElementParent).parent().children('.' + STEPDOWN_TAB + '_inputParent').
                        find('.dropDown_SF_CAL').find('.amtInput_SF_CAL').val();
                }
                break;
        }
        $(data['referenceData']['parent']).empty();
        constructIntialLoad(data['referenceData']['parent'],
            data['referenceData']['root'], requestDetails);
    }

    function getUpdatedDropdownList(amount1, arrayList, details) {
        type = details.selectedSubProductDetails.defaultType;
        if (isAvailable(amount1)) {
            var amount = parseFloat(amount1);
            var index = -1,
                range = -1;
            if ((amount >= arrayList[0] &&
                amount <= arrayList[arrayList.length - 1]) ||
                (parseFloat(details.data["MSRP"]) - parseFloat(amount)) > 100000) {
                for (var sf = 0; sf < arrayList.length - 1; sf++) {
                    if (amount == arrayList[sf])
                        index = sf;
                    if (amount > arrayList[sf] && amount < arrayList[sf + 1])
                        range = sf + 1;
                }
                if (amount == arrayList[arrayList.length - 1])
                    index = arrayList.length - 1;
                if (index == -1 && range != -1) {
                    arrayList.splice(range, 0, amount);
                }
                else
                    if (index == -1 && range == -1) {
                        console.log("Range Error");
                    }
            } else {
                console.log("DOWN_PAYMENT_NOT_IN_RANGE");
                $(details).append(sfLoadErrorMsg(staticDataFromXML[details.marketID]['DOWN_PAYMENT_NOT_IN_RANGE'], type));
            }
        }
        return arrayList;
    }

    function addSFCalLoadingData(reference) {
        $(reference).parent().prepend($('<div class="sf_calLoading"><div>' + reference.loading + '</div></div>'));
        $(reference).empty();
    }

    function getUpdatedDropdownPercentageList(amount1, arrayList) {
        if (isAvailable(amount1)) {
            var amount = parseFloat(amount1);
            var index = -1,
                range = -1;
            if ((amount) >= parseFloat(arrayList[0]) &&
                (amount) <= parseFloat(arrayList[arrayList.length - 1])) {
                for (var sf = 0; sf < arrayList.length - 1; sf++) {
                    if (parseFloat(amount) == parseFloat(arrayList[sf]))
                        index = sf;
                    if (parseFloat(amount) > parseFloat(arrayList[sf]) &&
                        parseFloat(amount) < parseFloat(arrayList[sf + 1]))
                        range = sf + 1;
                }
                if (parseFloat(amount) == parseFloat(arrayList[arrayList.length - 1]))
                    index = arrayList.length - 1;
                if (index == -1) {
                    var calulatedValue = parseFloat(amount);
                    var tempValue = ('' + calulatedValue).split('.');
                    if (tempValue[1].length >= 2) {
                        if (parseInt(tempValue[1]) == 0)
                            arrayList.splice(range, 0, Math.floor(calulatedValue));
                        else
                            arrayList.splice(range, 0, calulatedValue);
                    }
                    else
                        arrayList.splice(range, 0, Math.floor(calulatedValue));
                }
            } else {
                console.log("Percentage range missmatched");
            }
        }
        return arrayList;
    }

    function getTermsUI(details) {
        var termDetails = details['terms'];
        var termParent = $('<div class="col-xs-12_SF_CAL paddingTop4_SF_CAL sf-js-terms-wrap"></div>');
        var termParentInner = $('<div class="sf-js-terms-wrap-inner"></div>');
        var termListWrap = $('<div class="sf-js-terms-wrap-inner-main"></div>');
        $(termParent).append('<span class="header_SF_CAL">' + staticDataFromXML[details['referenceData']['MARKET_ID']]['TERM(MONTHS)'] + ':</span>');
        var leftArrow = $('<a href="javascript:void(0);" class="leftArrow_SF_CAL btnPadding_SF_CAL sf-js-terms-button" target="tabsInner_SF_CAL"><i class="arrow left"></a>');
        var rightArrow = $('<a href="javascript:void(0);" class="rightArrow_SF_CAL btnPadding1_SF_CAL sf-js-terms-button" target="tabsInner_SF_CAL"><i class="arrow right"></a>');
        $(leftArrow).addClass("disabled");
        $(leftArrow).click(function (event) {
            event.preventDefault();
            scrollTermsElements(this, false, 240, 700);
        });
        $(rightArrow).click(function (event) {
            event.preventDefault();
            sfElementObject.termsResized = true;
            scrollTermsElements(this, true, 210, 700, sfElementObject.termsResized);
        });
        $(termParent).append(leftArrow);
        $(termParent).append(rightArrow);
        var termList = $('<ul class="nav_SF_CAL nav-tabs_SF_CAL buttonTypes_SF_CAL tabsInner_SF_CAL" termdata></ul>');
        var purchaseTax = {};
        var termDetailsNew = [];
        var purchaseTaxDefaultTerm = 0;
        var bonusAmountForPurchaseTax = 0;
        for (var i = 0; i < termDetails.length; i++) {
            if (termDetails[i]["CALCULATION_TYPE"] == "CALEX")
                termDetailsNew.push(termDetails[i]);
            else {
                if (termDetails[i]["CALCULATION_TYPE"] == "CALPU")
                    purchaseTax[details['referenceData']['defaultTerm']] = termDetails[i]["installment"];
                    purchaseTaxDefaultTerm = termDetails[i]["term"]; 
                    bonusAmountForPurchaseTax = termDetails[i]["yearlyPayment"];
                    
            }
        }
        for (var i = 0; i < termDetailsNew.length; i++) {

            termDetailsNew[i]["installment"] = formatCurrency(termDetailsNew[i]["installment"]);

            var termItem = $('<li class="termInterest_SF_CAL' + ((termDetailsNew[i]["term"] == details['referenceData']['defaultTerm']) ? ' active' : '') +
                '" index="' + i +
                '"bonusAmountForPurchaseTax="' + bonusAmountForPurchaseTax + 
                '"purchaseTaxDefaultTerm="' + purchaseTaxDefaultTerm + 
                '" purchaseTax="' + ((termDetailsNew[i]["term"] == details['referenceData']['defaultTerm']) ? (isAvailable(purchaseTax[details['referenceData']['defaultTerm']]) ? formatCurrency(purchaseTax[details['referenceData']['defaultTerm']]) : "") : '') + '">' +
                '<a href="javascript:void(0);" class="button_SF_CAL">' +
                '<span>&#65509;</span>' +
                '<span class="termInterest_monthly_SF_CAL">' + termDetailsNew[i]["installment"] + '</span>' +
                '<span class="termInterest_terms_SF_CAL" selectedterm="' + termDetailsNew[i]["term"] + '">' + termDetailsNew[i]["term"] + '<span class="">&#26376;</span></span> ' +
                '<div>' + staticDataFromXML[details['referenceData']['MARKET_ID']]['TOTAL'] + ': <span class="termInterest_total_SF_CAL" terminterest="' + termDetailsNew[i]["interestRate"] + '">' + termDetailsNew[i]["interestRate"] + '%</span></div>' +
                '</a>' +
                '</li>');
            $(termItem).click(function () {
                if ($(this).hasClass("active")) {
                } else {
                    $(this).parent().children().each(function () {
                        $(this).removeClass("active");
                    });
                    $(this).addClass("active");
                    var tabContainer = $(this).parents(".tabcontent_SF_CAL");
                    if ($(tabContainer).hasClass(STEPDOWN_TAB)) {
                        $(tabContainer).find(".stepDownInstallments_SF_CAL").empty();
                        $(tabContainer).find(".stepDownInstallments_SF_CAL").append(getStepDownMonthlyInstallmentUI(
                            details['terms'][$(this).attr('index')]['SFProductStepDownMonthlyInstallment']));
                    } else {
                        $(tabContainer).find(".SFamount_monthlyInstallment_SF_CAL").text($(this).find('.termInterest_monthly_SF_CAL').text());
                    }
                }
            });
            $(termList).append(termItem);
        }
        $(termParent).append(termList);
        $(termList).wrap(termListWrap);
        $(termParent).wrapInner(termParentInner);
        return termParent;
    }

    function getPurchaseDetails(purchaseTax, Visibility, reference) {
        var conditiontarget = "condition_" + reference['parent']["0"].classList[2] + reference['parent'].attr('index');
        var disclaimertarget = "disclaimer_" + reference['parent']["0"].classList[2] + reference['parent'].attr('index');
        var visibleData = "visible_" + reference['parent']["0"].classList[2] + reference['parent'].attr('index');
        var taxData = "tax_" + reference['parent']["0"].classList[2] + reference['parent'].attr('index');
        var installmentData = "installment_" + reference['parent']["0"].classList[2] + reference['parent'].attr('index');
        var parent = reference['parent'];
        var check = reference['defaultChecked'];
        var disabled = "";
        var purchaseArray = [];
        var purchaseHtml = $('<div class="purchaseTax_SF_CAL col-xs-12_SF_CAL"></div>');
        var puchaseInternal = $('<div class="purchase_SF_CAL"  style="display:' + ((Visibility == 1) ? 'block' : 'none') + '"></div>');
        var purchaseClear = $('<div class="sf-js-clearfix"></div>');

        var bonusAmountForPurchaseTax = 0; 
        if (isAvailable(purchaseTax)) {
            for (var i = 0; i < purchaseTax.length; i++) {
                purchaseArray.push(purchaseTax[i]["ASSOCIATE_SERVICE_ID"]);
            }
            if (purchaseArray.length > 0 && (purchaseArray.indexOf("AS00004") != -1)) {
                var purchaseTaxData = '',
                    term = '';
                $(parent).find(".tabsInner_SF_CAL").children().each(function () {
                    if ($(this).hasClass("active")) {
                        purchaseTaxData = $(this).attr("purchasetax");
                        
                        term = $(this).attr("purchaseTaxDefaultTerm"); 
                        bonusAmountForPurchaseTax = $(this).attr("bonusAmountForPurchaseTax");
                    }
                });
                if (!isAvailable(purchaseTaxData)) {
                    disabled = "disabled";
                }
                if (isAvailable(check)) {
                    if (check == true) {
                        check = "checked";
                    }
                    else {
                        check = "unchecked";
                    }
                }
                else {
                    check = "unchecked";
                }
                var sPurTax = staticDataFromXML[reference['MARKET_ID']]['ADD_ON_MONTHLY_INSTALLMENT'] + ": ";                   //new lines
                sPurTax = sPurTax.replace('x', term);

                
                    if (reference['type'] == "bonustab")
                    {
                        var bonusAmtText = staticDataFromXML[reference['MARKET_ID']]['ADD_ON_BONUS_AMOUNT_PURCHASE_TAX'] + ": ";
                         var inputchk = $('<label class="control_SF_CAL control-checkbox_SF_CAL header_SF_CAL" style="right:0px"><input type="checkbox" name="purchase" class="group1_SF_CAL" ' + disabled + ' ' + check + '>' + staticDataFromXML[reference['MARKET_ID']]['PURCHASE_TAX'] +
                                        '<div class="control_indicator_SF_CAL"></div></label>' + '<div class="customInnerInfoIcon_SF_CAL" target=' + conditiontarget + '>' + '<a href="javascript:void(0);" class="bmw-i-icon">&#1110;</a>' + '</div> ' +
                                        '<div class="sf-js-clearfix"></div><div class="sf-js-purchase-show" style="display:' + ((check == "checked") ? 'inline' : 'none') + '"><span class="header_SF_CAL visibleData_SF_CAL ' + visibleData + '">' + sPurTax + '</span>' +
                                        '<span class="taxValue_SF_CAL ' + taxData + '">&#65509;</span><span class="purchaseTaxData taxValue_SF_CAL ' + installmentData + '">' + formatCurrency(purchaseTaxData) + '。 </span><span class="header_SF_CAL visibleData_SF_CAL ' + visibleData + '">' + bonusAmtText + '</span><span class="taxValue_SF_CAL ' + taxData + '">&#65509;</span><span class="purchaseTaxData taxValue_SF_CAL ' + installmentData + '">' + formatCurrency(bonusAmountForPurchaseTax) + '</span></div>');

                    }
                    else
                    {
                       var inputchk = $('<label class="control_SF_CAL control-checkbox_SF_CAL header_SF_CAL" style="right:0px"><input type="checkbox" name="purchase" class="group1_SF_CAL" ' + disabled + ' ' + check + '>' + staticDataFromXML[reference['MARKET_ID']]['PURCHASE_TAX'] +
                                '<div class="control_indicator_SF_CAL"></div></label>' + '<div class="customInnerInfoIcon_SF_CAL" target=' + conditiontarget + '>' + '<a href="javascript:void(0);" class="bmw-i-icon">&#1110;</a>' + '</div> ' +
                                '<div class="sf-js-clearfix"></div><div class="sf-js-purchase-show" style="display:' + ((check == "checked") ? 'inline' : 'none') + '"><span class="header_SF_CAL visibleData_SF_CAL ' + visibleData + '">' + sPurTax + '</span>' +
                                '<span class="taxValue_SF_CAL ' + taxData + '">&#65509;</span><span class="purchaseTaxData taxValue_SF_CAL ' + installmentData + '">' + formatCurrency(purchaseTaxData) + '</span></div>');

                    }
                    
               
                
               
                puchaseInternal.append(inputchk);
                puchaseInternal.append(purchaseClear);
                purchaseHtml.append(puchaseInternal);
                $(inputchk).click(function () {
                    var sfCheckParent = $(this).parent().find(".sf-js-purchase-show");
                    reference['defaultChecked'] = $(inputchk).children('input')[0].checked;
                    var visible = "." + visibleData;
                    var tax = "." + taxData;
                    var installment = "." + installmentData;
                    if (reference['defaultChecked'] == true) {
                        $(this).parent().find(".sf-js-purchase-show").show();
                    }
                    else {
                        $(this).parent().find(".sf-js-purchase-show").hide();
                    }
                });

            }

        } else {
            console.log("No Purchase Tax or ASSOCIATE LIST");
        }
        var insurance = $('<div class="col-xs-12_SF_CAL header_SF_CAL paddingLeft0_SF_CAL insurance_SF_CAL" style="display:' + ((Visibility == 1) ? 'block' : 'none') + '; right:0px" >' +
            staticDataFromXML[reference['MARKET_ID']]['INSURANCE'] + '<div class="customInnerInfoIcon_SF_CAL" target=' + conditiontarget + '>' + '<a href="javascript:void(0);" class="bmw-i-icon">&#1110;</a>' + '</div>' +
            '</div>');
        purchaseHtml.append(insurance);
        $(purchaseHtml).find(".customInnerInfoIcon_SF_CAL").click(function () {
            var target = $(this).attr("target");
            var targetAvailable = $(parent).find("." + target).offset();
            if (!isNotVailable(targetAvailable)) {
                var etop = $(parent).find("." + target).offset().top;
                $('html, body').animate({
                    scrollTop: etop
                }, 500);
            }
        });
        return purchaseHtml;
    }

    function getConditionDescription(conditionalDescription, reference) {
        var conditiontarget = 'condition_' + reference['parent']["0"].classList[2] + reference['parent'].attr('index');
        var condition = $('<div class="col-xs-12_SF_CAL condition_SF_CAL">' +
            '<h3 class="' + conditiontarget + '">' + staticDataFromXML[reference['MARKET_ID']]['CONDITION_DESCRIPTION'] + '</h3>' +
            '<div class="data_SF_CAL datapadding_SF_CAL">' + conditionalDescription + '</div>' +
            '</div>');
        return condition;
    }

    function getDisclaimerText(disclaimerText, reference) {
        var disclaimertarget = "disclaimer_" + reference['parent']["0"].classList[2] + reference['parent'].attr('index');
        var disclaimer = $('<div class="col-xs-12_SF_CAL disclamier_SF_CAL">' +
            '<h3 class="' + disclaimertarget + '">' + staticDataFromXML[reference['MARKET_ID']]['DISCLAIMER_TEXT'] + '</h3>' +
            '<div class="data_SF_CAL datapadding_SF_CAL">' + disclaimerText + '</div>' +
            '</div>');
        return disclaimer;
    }

    function bmwLinkText(bmwLinkText, reference) {
        var linkDiv = '<div class="col-xs-12_SF_CAL paddingLeft0_SF_CAL  header2_SF_CAL">' +
            '<span >' + staticDataFromXML[reference['MARKET_ID']]['MONTHLY_INSTALLMENT_PURCHASE'] + '</span>' +
            '<a href="' + staticDataFromXML[reference['MARKET_ID']]['VISIT_OUR_BMW_WEBSITE_URL'] + '" target="_blank">' + staticDataFromXML[reference['MARKET_ID']]['VISIT_OUR_BMW_WEBSITE'] + '</a>' +
            '</div>';
        return linkDiv;
    }

    function isNotVailable(value) {
        return (typeof value == "undefined" || value == null);
    }

    function isAvailable(value) {
        if (typeof value != "undefined" && value != null)
            value = '' + value;
        return (typeof value != "undefined" && value != null && value.trim() != '');
    }

    function isEmpty(str) {
        return (typeof str == 'undefined' || !str || str.length === 0 || str === "");
    }

    function addEmptySFTabsContent(reference, tabType, mainTabsParent) {
        for (var k = 0; k < reference.subProducts[tabType].length; k++) {
            $(mainTabsParent).append($('<div class="sf-js-tab_main"><div class="tabcontent_SF_CAL row_SF_CAL ' + tabType +
                '" subproductId="' + reference.subProducts[tabType][k]["SUBPROD_ID"] +
                '" subproductInternalId="' + reference.subProducts[tabType][k]["SUBPROD_INTERNAL_ID"] + '" index="' + k + '"></div></div>'));
        }
    }
    function getSelectedTabIndexValue(reference, tabType, isDefault) {
        if (typeof isDefault != "undefined" && isDefault) {
            for (var j = 0; j < reference.subProducts[tabType].length; j++) {
                if (typeof reference.subProducts[tabType][j]['IS_DEFAULT'] != "undefined" &&
                    reference.subProducts[tabType][j]['IS_DEFAULT'] != 0) {
                    return j;
                }
            }
        }
        for (var k = 0; k < reference.subProducts[tabType].length; k++) {
            if (reference.subProducts[tabType][k]['SUBPROD_ID'] == reference.data["SUBPROD_ID"] &&
                reference.subProducts[tabType][k]['SUBPROD_INTERNAL_ID'] == reference.data["SUBPROD_INTERNAL_ID"]) {
                return k;
            }
        }
        return -1;
    }
    function getSFCalFloatFixedPointValue(value, precision) {
        precision = parseInt('' + precision);
        value = parseFloat(value + '');
        value = (value + '').split(".");
        if (value.length < 2 || (value.length > 1 && parseInt(value[1]) == 0)) {
            return value[0];
        }
        else {
            if (precision > value[1].length || precision <= 0)
                return (value[0] + '.' + value[1]);
            else
                return (value[0] + '.' + value[1].substring(0, precision));
        }
    }
    function formatCurrency(number) {
        if (number.toString().indexOf(',') > -1) {
            number = parseFloat(number.replace(",", ""));

        }
        var num;
        var isNeg = 0;
        if (number < 0) {
            number = Math.abs(number);
            isNeg = 1;
        }
        if (number != "" && number != null && number != undefined && !(isNaN(number))) {
            var numdecimal = ""; // new Array();
            num = 0;
            number = parseFloat(number);
            num = number.toFixed(2);
            numdecimal = num.split(".");
            num = String(numdecimal[0]), fnum = [];
            num = num.match(/\d/g).reverse();
            i = 1;
            $.each(num, function (k, v) {
                fnum.push(v);
                if (i % 3 == 0) {
                    if (k < (num.length - 1)) {
                        fnum.push(",");
                    }
                }
                i++;
            });
            fnum = fnum.reverse().join("");
            if (numdecimal[1] == '' && numdecimal.length > 1)
                fnum = fnum + '.';
            else if (numdecimal[1] != '' && numdecimal.length > 1) {
                fnum = fnum + '.' + numdecimal[1];
            }
            if (isNeg == 1) {
                return ('-' + fnum);
            }
            else {
                return (fnum);
            }
        }
        else {
            if (isNeg == 1) {
                return '-' + number;
            }
            else {
                //return number;
                return 0;
            }
        }
    }

    function resizeProductTabs() {
        if (typeof sfElementObject == "undefined")
            return;
        sfElementObject.productsResized = false;
        var tabsParent = $(".topParent_SF_CAL").find(".sf-js-carousel-inner");
        var tabsContainer = $(".topParent_SF_CAL").find(".sf-js-carousel-inner").find("ul");
        var liContainerWidth = $(".topParent_SF_CAL").find(".sf-js-carousel-inner").width();
        var mainContainer = $(".topParent_SF_CAL").outerWidth();

        $(tabsContainer).css("width", "");

        if (mainContainer > 200 && mainContainer < 565) {
            $(tabsContainer).children('li').outerWidth(parseInt(liContainerWidth / 1));

        }
        else if (mainContainer > 565 && mainContainer < 767) {
            $(tabsContainer).children('li').outerWidth(parseInt(liContainerWidth / 2));
        }
        else if (mainContainer > 767 && mainContainer < 1024) {
            $(tabsContainer).children('li').outerWidth(parseInt(liContainerWidth / 3));
        }
        else {
            $(tabsContainer).children('li').outerWidth(parseInt(liContainerWidth / 4));
        }
        var elemScrollLeft = $(".sf-js-carousel-inner").scrollLeft();
        var ulWidth = $(".sf-js-carousel-inner").width();
        var liItemsCount = $('.sf-js-carousel-inner').find('ul').children('li').length;
        var itemWidth = $(tabsContainer).children('li').outerWidth();
        var activeElement = $(tabsContainer).children('li.active');
        var scrollWidth = $(tabsParent)[0].scrollWidth;
        var activeScroll = activeElement.offset().left - tabsParent.offset().left + tabsParent.scrollLeft();
        var maxWidth = (liItemsCount * itemWidth);
        //$(tabsParent).scrollLeft(0);

        if ($(activeElement).attr('elempos') == 1) {
            $(tabsParent).scrollLeft(0);
            $(tabsParent).animate({
                scrollLeft: '+=' + (activeScroll - 20)
            }, 500);
        }
        else if ($(activeElement).attr('elempos') == liItemsCount) {
            if (mainContainer > 200 && mainContainer < 565) {
                $(tabsParent).scrollLeft(0);
                $(tabsParent).animate({
                    scrollLeft: '+=' + (activeScroll - 20)
                }, 500);
            }
            if ((mainContainer > 767 && mainContainer < 1024) || (mainContainer > 565 && mainContainer < 767)) {
                if ((elemScrollLeft + ulWidth) > (ulWidth)) {
                    $(".sf-js-carousel-inner").animate({
                        scrollLeft: '-=' + ((elemScrollLeft + ulWidth) - (maxWidth))
                    }, 500);
                }
            }
        } else if ($(activeElement).attr('elempos') == (liItemsCount - 1)) {
            if (mainContainer > 200 && mainContainer < 565) {
                $(tabsParent).scrollLeft(0);
                $(tabsParent).animate({
                    scrollLeft: '+=' + (activeScroll - 20)
                }, 500);
            }
            if ((mainContainer > 767 && mainContainer < 1024) || (mainContainer > 565 && mainContainer < 767)) {
                if ((elemScrollLeft + ulWidth) > (ulWidth)) {
                    $(".sf-js-carousel-inner").animate({
                        scrollLeft: '-=' + ((elemScrollLeft + ulWidth) - (maxWidth))
                    }, 500);
                }
            }

        } else if ($(activeElement).attr('elempos') == (liItemsCount - 2)) {
            if (mainContainer > 200 && mainContainer < 565) {
                $(tabsParent).scrollLeft(0);
                $(tabsParent).animate({
                    scrollLeft: '+=' + (activeScroll - 20)
                }, 500);
            }
            if (mainContainer > 767 && mainContainer < 1024) {
                if ((elemScrollLeft + ulWidth) > (ulWidth)) {
                    $(".sf-js-carousel-inner").animate({
                        scrollLeft: '-=' + ((elemScrollLeft + ulWidth) - (maxWidth))
                    }, 500);
                }
            }
            if (mainContainer > 565 && mainContainer < 767) {
                $(tabsParent).scrollLeft(0);
                $(tabsParent).animate({
                    scrollLeft: '+=' + (activeScroll - 20)
                }, 500);
            }
        } else {
            $(tabsParent).scrollLeft(0);
            $(tabsParent).animate({
                scrollLeft: '+=' + (activeScroll - 20)
            }, 500);
        }

        var maxElementwidth = 0;
        var scrollResizeWidth = 0;

        maxElementwidth = ($(tabsContainer).children('li').length) * ($(tabsContainer).children('li').outerWidth());
        scrollResizeWidth = maxElementwidth - ($(tabsParent).outerWidth() - 40);
        //$(tabsParent).off('scroll');
        $(tabsParent).on('scroll', function () {
            onScrollTerms(scrollResizeWidth, $(this), "subProducts");
        });

        return false;
    }
    function resizeTermsUI(reference, onClickTab) {
        if (typeof sfElementObject == "undefined")
            return;
        if (onClickTab)
            sfElementObject.termsResized = false;
        var subProductId = $(document).find(".sfProductTab_SF_CAL.active").attr('subproductid');
        var subProductIntId = $(document).find(".sfProductTab_SF_CAL.active").attr('subproductinternalid');
        var activeIndex = $(document).find(".sfProductTab_SF_CAL.active").attr('index');
        var activeTabSelector = $('.tabcontent_SF_CAL[subproductid=' + subProductId + '][subproductinternalid=' + subProductIntId + ']')[0];

        var tabsParent = $(activeTabSelector).find(".sf-js-terms-wrap-inner-main")[0];
        var tabsTermContainer = $(tabsParent).find("ul");
        var liTermContainerWidth = $(tabsParent).outerWidth();
        var mainTermContainer = $(activeTabSelector).outerWidth(true);
        var maxElementwidth = 0;
        var scrollResizeWidth = 0;
        var termHeight = 0;

        $(tabsTermContainer).attr('maxelemwidth', "");
        $(tabsTermContainer).attr('elemscroll', "");

        if (mainTermContainer > 200 && mainTermContainer < 640) {
            $(tabsTermContainer).children('li').css("width", parseInt((liTermContainerWidth / 2)));
        }

        else if (mainTermContainer > 641 && mainTermContainer < 880) {
            $(tabsTermContainer).children('li').css("width", parseInt((liTermContainerWidth / 3)));
        }

        else {
            $(tabsTermContainer).children('li').css("width", parseInt((liTermContainerWidth / 4)));
        }

        termHeight = $(activeTabSelector).find('ul').children('li').height();

        $(activeTabSelector).find('.sf-js-terms-button').height(termHeight);

        var inner_main = $(tabsParent).parents().children(".sf-js-terms-wrap-inner-main")[0];

        var child_element = $(inner_main).find('ul').children('.termInterest_SF_CAL');
        var scrollWidth = $(inner_main).scrollWidth;

        var itemWidth = $($(child_element)[0]).outerWidth();
        var liItems = $(child_element).length;
        maxElementwidth = (itemWidth) * (liItems);
        scrollResizeWidth = maxElementwidth - $(inner_main).outerWidth();
        if($(inner_main).outerWidth() > maxElementwidth){
            scrollResizeWidth = 0;
        }
        $(inner_main).find('ul').attr('maxelemwidth', parseInt(maxElementwidth));
        $(inner_main).find('ul').attr('elemscroll', scrollResizeWidth);
        $(inner_main).scrollLeft(0);
        if (scrollResizeWidth === 0)
            $(tabsParent).parent().find(".rightArrow_SF_CAL").addClass("disabled");
        if (scrollResizeWidth > 0)
            $(tabsParent).parent().find(".rightArrow_SF_CAL").removeClass("disabled");
        if ($(tabsParent).scrollLeft() === 0)
            $(tabsParent).parent().find(".leftArrow_SF_CAL").addClass("disabled");

        return false;
    }

    function onScrollTerms(scrollWidth, parentRef, type, isResized) {
        var scrollLeft = $(parentRef).scrollLeft();
        if (scrollLeft > scrollWidth) {
            var diff = scrollLeft - scrollWidth;
            scrollLeft = scrollLeft - diff;
        }
        if (type == "subProducts") {
            if ((scrollLeft != 0))
                $(parentRef).parent().children(".leftArrow_SF_CAL").prop("disabled", false);

            if ((scrollLeft === 0))
                $(parentRef).parent().children(".leftArrow_SF_CAL").prop("disabled", true);

            if ((scrollWidth === scrollLeft)) {
                $(parentRef).parent().children(".rightArrow_SF_CAL").prop("disabled", true);
            }
            if ((scrollWidth != scrollLeft)) {
                $(parentRef).parent().children(".rightArrow_SF_CAL").prop("disabled", false);
            }
        }
        if (type == "termsType") {
            // if ((scrollLeft != 0))
            //     $(parentRef).parent().children(".leftArrow_SF_CAL").removeClass("disabled");

            // if ((scrollLeft === 0))
            //     $(parentRef).parent().children(".leftArrow_SF_CAL").addClass("disabled");

            // if ((scrollWidth === scrollLeft)) {
            //     $(parentRef).parent().children(".rightArrow_SF_CAL").addClass("disabled");
            // }
            // if ((scrollWidth != scrollLeft)) {
            //     $(parentRef).parent().children(".rightArrow_SF_CAL").removeClass("disabled");
            // }
        }
    }

    function initiateAjaxCall(data, url, callback, reference, rootElement) {
        $(rootElement).parent().children(".sf_calLoading").addClass("active");
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": url,
            "type": ((typeof data == "undefined" || data == null) ? "GET" : "POST"),
            "contentType": "application/json",
            "dataType": "json",
            "processData": false,
            "cache": false,
            "success": function (response) {
                $(rootElement).parent().children(".sf_calLoading").removeClass("active");
                callback(response, reference);
            },
            "error": function () {
                $(rootElement).parent().children(".sf_calLoading").removeClass("active");
                console.log("[Service Error]");
                sfErrorMsg(reference, staticDataFromXML[reference.marketID]['SOMETHING_WENT_WRONG_PLEASE_TRY_AGAIN_LATER']);
            }
        };
        if (typeof data != "undefined" || data != null)
            settings["data"] = data;
        jQuery.support.cors = true;
        $.ajax(settings);
    }

    function initiateXMLAjaxCall(url, callback, rootElement) {
        $(rootElement).parent().children(".sf_calLoading").addClass("active");
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                $(rootElement).parent().children(".sf_calLoading").removeClass("active");
                callback(this.responseXML);
            }
        };
        xhttp.open("GET", url, true);
        xhttp.send();
    }
});