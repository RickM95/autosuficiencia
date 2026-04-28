export const NEEDS_DOMAINS = [
  { key: 'foodSecurity', labelEn: 'Food security', labelEs: 'Alimentación', emoji: '🍽️', critical: 2, warn: 3 },
  { key: 'housingSecurity', labelEn: 'Housing stability', labelEs: 'Vivienda', emoji: '🏠', critical: 2, warn: 3 },
  { key: 'healthStatus', labelEn: 'Physical health', labelEs: 'Salud física', emoji: '🏥', critical: 2, warn: 3 },
  { key: 'mentalHealth', labelEn: 'Mental health', labelEs: 'Salud mental', emoji: '🧠', critical: 2, warn: 3 },
  { key: 'safetyLevel', labelEn: 'Personal safety', labelEs: 'Seguridad', emoji: '🛡️', critical: 2, warn: 3 },
  { key: 'clothingNeeds', labelEn: 'Clothing', labelEs: 'Ropa', emoji: '👗', critical: 2, warn: 3 },
  { key: 'transportAccess', labelEn: 'Transportation', labelEs: 'Transporte', emoji: '🚗', critical: 2, warn: 3 },
]

export const INCOME_FIELDS = ['incSalary', 'incSpouse', 'incBusiness', 'incRent', 'incRemittance', 'incGovAid', 'incFamily', 'incOther']
export const EXPENSE_FIELDS = ['expHousing', 'expFood', 'expTransport', 'expUtilities', 'expHealth', 'expClothing', 'expEducation', 'expDebt', 'expSavings', 'expTithes', 'expPersonal', 'expOther']

export const COMPLETENESS_WEIGHTS = [
  { key: 'name', weight: 3 },
  { key: 'location', weight: 1 },
  { key: 'age', weight: 1 },
  { key: 'employmentStatus', weight: 2 },
  { key: 'education', weight: 1 },
  { key: 'foodSecurity', weight: 3 },
  { key: 'housingSecurity', weight: 3 },
  { key: 'healthStatus', weight: 2 },
  { key: 'mentalHealth', weight: 2 },
  { key: 'incSalary', weight: 2 },
  { key: 'expHousing', weight: 1 },
  { key: 'expFood', weight: 1 },
  { key: 'debts', weight: 2 },
  { key: 'emergencyFund', weight: 2 },
  { key: 'skills', weight: 1 },
  { key: 'communityResources', weight: 1 },
  { key: 'shortTermGoals', weight: 3 },
  { key: 'mediumTermGoals', weight: 3 },
  { key: 'longTermGoals', weight: 2 },
  { key: 'commitmentStatement', weight: 2 },
]

export const FINANCE_SCORE_RULES = [
  { condition: 'balance > 0', add: 15 },
  { condition: 'balance > income * 0.2', add: 10 },
  { condition: 'debtToIncome < 15', add: 10 },
  { condition: 'debtToIncome < 5', add: 5 },
  { condition: 'emergencyFundMonths >= 3', add: 10 },
  { condition: 'emergencyFundMonths >= 6', add: 5 },
  { condition: 'savingsRate >= 10', add: 10 },
  { condition: 'savingsRate >= 20', add: 5 },
  { condition: 'totalDebt === 0', add: 10 },
  { condition: 'balance < 0', add: -20 },
  { condition: 'debtToIncome > 30', add: -15 },
  { condition: 'debtToIncome > 50', add: -10 },
]

export const GOALS_SCORE_RULES = {
  hasShortWeight: 25,
  hasMediumWeight: 25,
  hasLongWeight: 20,
  smartWeight: 30,
}
