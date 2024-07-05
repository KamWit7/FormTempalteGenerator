// add here your get response in form of object

module.exports = {
  internalLeaseIncludedInAssets: 'No',
  hasExternalCredits: 'No',
  hasExternalLease: 'No',
  hasPublicLawObligations: 'No',
  externalCredits: [
    {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      financingInstitutionName: 'Bank XYZ',
      obligationType: 'CurrentAccountCredit',
      currencyCode: 'USD',
      monthlyInstallmentAmount: 1500,
      grantedFinancingAmount: 50000,
      creditBalanceAmount: 20000,
      protectionType: 'Collateral',
      financingFrom: new Date('2022-01-15'),
      financingTo: new Date('2025-01-15'),
    },
    {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      financingInstitutionName: 'Bank XYZ',
      obligationType: 'CurrentAccountCredit',
      currencyCode: 'USD',
      monthlyInstallmentAmount: 1500,
      grantedFinancingAmount: 50000,
      creditBalanceAmount: 20000,
      protectionType: 'Collateral',
      financingFrom: new Date('2022-01-15'),
      financingTo: new Date('2025-01-15'),
    },
  ],
  externalLease: [
    {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      leaseCompanyName: 'Leasing Corp',
      currencyCode: 'EUR',
      leaseBalanceAmount: 30000,
      monthlyInstallmentAmount: 1000,
      leaseObjectType: 'Vehicle',
      financingFrom: new Date('2021-06-01'),
      financingTo: new Date('2026-06-01'),
      isIncludedInAssets: 'No',
    },
  ],
  publicLawObligations: [
    {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      obligationName: 'Tax Obligation',
      obligationValue: {
        amount: 800,
        currency: 'PLN',
      },
      obligationEnd: new Date('2024-07-01'),
    },
  ],
}
