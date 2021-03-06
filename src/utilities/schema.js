export function schemaGenerator(_schema, _type) {
    return JSON.parse(JSON.stringify(schema[_schema][_type]));
}
const apiSchema = {
    transaction: {
        createdTimeStamp: '',
        lastUpdatedTimeStamp: '',
        transactionTypeId: '',
        timeStamp: '',
        comment: '',
        amount: '',
        amountTypeId: '',
    }
}
const uiSchema = {
    transaction: {
        transactionTypeId: '',
        transactionType: '',
        transactionClassification: '',
        timeStamp: '',
        amount: '',
        amountTypeId: '',
        comment: ''
    }
}

const schema = {
    uiSchema, apiSchema
}
export const componentSchema = (_component, _obj) => {
    switch (_component) {
        case 'Analyse': {
            switch (_obj) {
                case 'charts': {
                    return [
                        {
                            id: 'expense_vs_savings',
                            text: 'Expense vs Saving',
                            period: '',
                            periodStatus: 0,
                            errorMsg: '',
                            query: {
                                fromDate: new Date(),
                                toDate: new Date()
                            },
                            result: [],
                            cognitiveResult: {
                                expense: [],
                                saving: [],
                                expenseOnly: [],
                                savingOnly: []
                            }
                        },
                        {
                            id: 'expense',
                            text: 'Expense',
                            period: '',
                            periodStatus: 0,
                            errorMsg: '',
                            query: {
                                fromDate: new Date(),
                                toDate: new Date()
                            },
                            result: [],
                            cognitiveResult: {
                                expense: [],
                                saving: [],
                                expenseOnly: [],
                                savingOnly: []
                            }
                        },
                        {
                            id: 'saving',
                            text: 'Saving',
                            period: '',
                            periodStatus: 0,
                            errorMsg: '',
                            query: {
                                fromDate: new Date(),
                                toDate: new Date()
                            },
                            result: [],
                            cognitiveResult: {
                                expense: [],
                                saving: [],
                                expenseOnly: [],
                                savingOnly: []
                            }
                        },
                    ];
                }
                case 'periodSet': {
                    return [
                        {
                            value: 'daily',
                            label: 'Daily'
                        },
                        {
                            value: 'weekly',
                            label: 'Weekly'
                        },
                        {
                            value: 'monthly',
                            label: 'Monthly'
                        },
                        {
                            value: 'yearly',
                            label: 'Yearly'
                        }
                    ]

                }
                default:
                    return {}
            }
        }
        default:
            return {}
    }
}

