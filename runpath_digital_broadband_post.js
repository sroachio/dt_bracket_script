async function(a) {
  // MAKE THE API CALL
  var formData = new FormData();
  formData.append('UserId', '00000000-0000-0000-0000-000000000000');
  console.log('postCode', this.memory.postCode)
  formData.append('Postcode', this.memory.postCode); // PostCode
  console.log('regionId', this.memory.regionId)
  formData.append('Region', this.memory.regionId); // Region
  formData.append('HasGasSupply', 'true');
  formData.append('HasDualFuel', 'false');
  formData.append('IsEconomySeven', 'false');
  formData.append('HasEnergyBill', 'true');
  formData.append('CurrentDualFuelTariffId', '0');
  formData.append('CurrentDualFuelPaymentMethod', '0');
  formData.append('CurrentDualFuelBillingMethod', '0');
  console.log('tariffId', this.memory.tariffId)
  formData.append('CurrentGasTariffId', this.memory.gasTariffId); // TariffID
  formData.append('CurrentGasPaymentMethod', '2');
  formData.append('CurrentGasBillingMethod', '2');
  console.log('gasConsumption', this.memory.gasConsumption)
  formData.append('GasYearlyUsage', this.memory.gasConsumption); // Usage
  formData.append('GasSpend', '0');
  formData.append('GasSpendPeriod', 'year');
  console.log('tariffId', this.memory.tariffId)
  formData.append('CurrentElectricityTariffId', this.memory.eleTariffId); // TariffID
  formData.append('CurrentElectricityPaymentMethod', '2');
  formData.append('CurrentElectricityBillingMethod', '2');
  console.log('electricityConsumption', this.memory.electricityConsumption)
  formData.append('ElectricYearlyUsage', this.memory.electricityConsumption); // Usage
  formData.append('ElectricYearlyUsageDay', '0');
  formData.append('ElectricYearlyUsageNight', '0');
  formData.append('ElectricUsageDayPercent', '0');
  formData.append('ElectricUsageNightPercent', '0');
  formData.append('ElectricitySpend', '0');
  formData.append('ElectricitySpendPeriod', 'year');
  formData.append('Compare', 'true');
  formData.append('FutureTariffType', 'DualFuel');
  formData.append('FuturePaymentMethod', '2');
  formData.append('BillingMethod', '3');
  formData.append('MustBeFixedRate', 'false');
  formData.append('MustBeVariableRate', 'false');
  formData.append('MustNotHaveCancellationFees', 'false');
  formData.append('MustBeGreen', 'false');
  formData.append('MustHaveLoyaltyRewards', 'false');
  formData.append('DualFuelLoyaltyPeriod', '0');
  formData.append('GasLoyaltyPeriod', '0');
  formData.append('ElectricLoyaltyPeriod', '0');
  formData.append('EstimateGasUsage', 'false');
  formData.append('EstimateElectricityUsage', 'false');
  formData.append('AreCommercial', 'true');
  formData.append('CostTerm', 'yearly');
  formData.append('StartIndex', '0');
  formData.append('PageSize', '999999'); // MAX size
  
  const request = async () => {
    try {
      const response = await fetch('https://www.runpathdigital.com/gas-electricity/GetResults', {
        method: 'POST',
        body: formData
      });
      const json = await response.json();
      console.log(json);
      return json;
    } catch (e) {
      throw new Error('There was an error in REST API Call, ', e.message);
    }
  }
  
  let data = await request();
  let response = JSON.parse(data.result);
  console.log(data);
  
  // Loop over and get the required data
  let results = [];
  let tariffs = response.FutureTariffs;
  
  for (let tariff of tariffs) {
    let gasRow = {};
    gasRow['Supplier'] = tariff.Gas.ProviderFullName || '';
    //gasRow['Plan'] = tariff.Gas.ProductCode || '';
    gasRow['Plan'] = tariff.TariffName || '';
    gasRow['Type'] = 'Gas';
    gasRow['Personal Projection'] = tariff.Gas.YearlyTotalCostIncVat || '';
    gasRow['Expected Savings'] = tariff.Gas.TotalYearlySavings || '';
    gasRow['Rating'] = tariff.Gas.Tiers[0].PricePerUnitIncVat || '';
    gasRow['Plan - Tariff Type'] = tariff.RateType || '';
    //gasRow['Plan - Price Guarantee'] = tariff.ComparisonPeriodMonths || '';
    gasRow['Plan - Price Guarantee'] = tariff.RollingEndDateMonths || tariff.ComparisonPeriodMonths || '';
    results.push(gasRow);
    
    let electricRow = {};
    electricRow['Supplier'] = tariff.Electricity.ProviderFullName || '';
    //electricRow['Plan'] = tariff.Electricity.ProductCode || '';
    electricRow['Plan'] = tariff.TariffName || '';
    electricRow['Type'] = 'Electricity';
    electricRow['Personal Projection'] = tariff.Electricity.YearlyTotalCostIncVat || '';
    electricRow['Expected Savings'] = tariff.Electricity.TotalYearlySavings || '';
    electricRow['Rating'] = tariff.Electricity.Tiers[0].PricePerUnitIncVat || '';
    electricRow['Plan - Tariff Type'] = tariff.RateType || '';
    //electricRow['Plan - Price Guarantee'] = tariff.ComparisonPeriodMonths || '';
    electricRow['Plan - Price Guarantee'] = tariff.RollingEndDateMonths || tariff.ComparisonPeriodMonths || '';
    results.push(electricRow);
  }
  
  return this.return(this.createData(results));
}
