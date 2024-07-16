"use strict";

const URL_APImindicador = "https://mindicador.cl/api/";
const CambioMonedas = document.getElementById("CambioMonedas");
const InputValor = document.getElementById("amount-input");
const BtnConversor = document.getElementById("BtnConversor");
const ConsultaGrafico = document.getElementById("ConsultaGrafico");
const ResultadoConversion = document.getElementById("resultado");


let selectedCurrency = null;
let DataHistorica = [];
let chart; 


const fetchAPI = async () => {
    try {
        const response = await fetch(URL_APImindicador);
        const data = await response.json();
        const filteredCurrencies = Object.entries(data)
            .filter(
                ([_, currency]) => typeof currency === "object" && currency.unidad_medida === "Pesos")
            .map(([_, { nombre, valor, codigo }]) => ({ nombre, valor, codigo }));
        displayMoneyExchange(filteredCurrencies, CambioMonedas);
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
};


const displayMoneyExchange = (currencies, container) => {
    const SelectInput = document.createElement("select");
    SelectInput.id = "select-money-exchange";
    SelectInput.className = "form-select";
    const Desabilitado = document.createElement("option");

    Desabilitado.textContent = "Selecciona una Divisa";
    Desabilitado.selected = true;
    Desabilitado.disabled = true;
    SelectInput.appendChild(Desabilitado);

    container.appendChild(SelectInput);
    currencies.forEach(({ nombre, valor, codigo }) => {
        const createOption = document.createElement("option");
        createOption.id = codigo;
        createOption.value = valor;
        createOption.textContent = nombre;
        SelectInput.appendChild(createOption);
    });


    SelectInput.addEventListener("change", handleSelectChange);
};


const handleSelectChange = (event) => {
    const selectElement = event.target;
    selectedCurrency = selectElement.value;
};


const fetchDates = async (codigo) => {
    const response = await fetch(`${URL_APImindicador}${codigo}`);
    const data = await response.json();
    return data.serie.slice(0, 10); 
};


const renderChart = (data) => {


    const labels = data.map(item => item.fecha.slice(0, 10));
    const values = data.map(item => item.valor);

    const ctx = document.getElementById('chart-container').getContext('2d');


    if (chart) {
        chart.destroy();
    }


    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Valor de la Moneda',
                data: values,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false,
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Valor en Moneda'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Fecha'
                    }
                }
            }
        }
    });
};


BtnConversor.addEventListener('click', () => {
    const Valor = parseInt(InputValor.value);
    if (selectedCurrency && Valor > 0 && Number.isInteger(Valor)) {
        const exchangeRate = parseFloat(selectedCurrency);
        const ConvertirValor = (Valor / exchangeRate).toFixed(2);
        ResultadoConversion.innerHTML = `El monto convertido es:<span class="valor"> ${ConvertirValor} </span>`;
    } else {
        alert('Por favor, selecciona una divisa y proporciona un monto válido');
    }
});


ConsultaGrafico.addEventListener('click', async () => {
    const selectElement = document.getElementById("select-money-exchange");
    const CodigoMoneda = selectElement.options[selectElement.selectedIndex].id;

    if (CodigoMoneda) {
        try {
            DataHistorica = await fetchDates(CodigoMoneda);
            renderChart(DataHistorica);
            MostrarValorHistorico(DataHistorica);
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    } else {
        alert('Por favor, selecciona una divisa.');
    }
});


const MostrarValorHistorico = (data) => {

    data.forEach(item => {
        const p = document.createElement("p");
        p.textContent = `Fecha: ${item.fecha.slice(0, 10)}, Valor: ${item.valor}`;
    });
};

fetchAPI();
