var Validator = function (options) {
    var rules = options.rules || {};
    var data = options.data || {};
    var errors = {};
    var messages = {
        required: 'The :attribute field is required.',
        email: 'The :attribute must be a valid email address.',
        min: {
            numeric: 'The :attribute must be at least :min.',
            string: 'The :attribute must be at least :min characters.'
        },
        max: {
            numeric: 'The :attribute may not be greater than :max.',
            string: 'The :attribute may not be greater than :max characters.'
        }
    };

    var prepareRules = function () {
        for (var index in rules) {
            var property = rules[index];
            if (!Array.isArray(property)) {
                rules[index] = property.split('|');
            }
        }
    };


    var addErrors = function (attribute, attributeErrors) {
        errors[attribute] = attributeErrors;
    };

    var createError = function (validationAttribute, validationRule, validationParams) {
        var errorMessage = '';
        switch (validationRule) {
            case 'required':
            case 'email':
                errorMessage = messages[validationRule].replace(":attribute", validationAttribute);
                break;
            case 'min':
                var type = 'numeric';
                if (typeof data[validationAttribute] == 'string') {
                    type = 'string';
                }
                errorMessage = messages[validationRule][type].replace(":attribute", validationAttribute);
                errorMessage = errorMessage.replace(":min", validationParams[0]);
                break;
            case 'max':
                var type = 'numeric';
                if (typeof data[validationAttribute] == 'string') {
                    type = 'string';
                }
                errorMessage = messages[validationRule][type].replace(":attribute", validationAttribute);
                errorMessage = errorMessage.replace(":max", validationParams[0]);
                break;
        }
        return errorMessage;
    };

    var isPassed = function (validationAttribute, validationRule, validationParams) {
        var result = false;
        switch (validationRule) {
            case 'required':
                if (!isEmpty(data[validationAttribute])) {
                    result = true;
                }
                break;
            case 'email':
                if (isEmpty(data[validationAttribute])) {
                    result = true;
                }
                else if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data[validationAttribute])) {
                    result = true;
                }
                break;
            case 'min':
                if (isEmpty(data[validationAttribute])) {
                    result = true;
                } else if (typeof validationAttribute == 'number') {
                    if (data[validationAttribute] >= validationParams[0]) {
                        result = true;
                    }
                } else if (typeof validationAttribute == 'string') {
                    if (data[validationAttribute].length >= validationParams[0]) {
                        result = true;
                    }
                }

                break;
            case 'max':
                if (isEmpty(data[validationAttribute])) {
                    result = true;
                } else if (typeof validationAttribute == 'number') {
                    if (data[validationAttribute] <= validationParams[0]) {
                        result = true;
                    }
                } else if (typeof validationAttribute == 'string') {
                    if (data[validationAttribute].length <= validationParams[0]) {
                        result = true;
                    }
                }
                break;
        }
        return result;

    };
    var isEmpty = function (value) {
        var result = false;
        switch (value) {
            case "":
            case undefined:
                result = true;
                break;
        }
        return result;
    };

    var fails = function () {
        return !passes();
    };
    var passes = function () {
        prepareRules();
        for (var validationAttribute in rules) {
            var attributeErrors = [];
            for (var index in rules[validationAttribute]) {
                var validationRule = rules[validationAttribute][index];
                var validationParams = [];
                if (validationRule.indexOf(':') != -1) {
                    var arr = validationRule.split(':');
                    for (var i in arr) {
                        if (i == 0) {
                            validationRule = arr[i];
                        } else {
                            validationParams.push(arr[i])
                        }
                    }
                }
                var result = isPassed(validationAttribute, validationRule, validationParams);
                if (!result) {

                    attributeErrors.push(createError(validationAttribute, validationRule, validationParams))
                }
            }
            if (attributeErrors.length > 0) {
                addErrors(validationAttribute, attributeErrors)
            }
        }
        if (Object.keys(errors).length > 0) {
            return false;
        }
        return true;
    };
    var getErrors = function () {
        return errors;
    };
    var getFirstError = function (attribute) {
        return errors[attribute][0];
    };

    this.getErrors = getErrors;
    this.getFirstError = getFirstError;
    this.fails = fails;
    this.passes = passes;
};
