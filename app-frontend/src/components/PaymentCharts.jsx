import { useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function PaymentCharts({ payments }) {
  // Process data for charts
  const processChartData = () => {
    // For payment method distribution (Pie Chart)
    const methodCounts = {};
    const methodColors = {
      credit_card: 'rgba(255, 99, 132, 0.8)',
      bank_transfer: 'rgba(54, 162, 235, 0.8)',
      paypal: 'rgba(255, 206, 86, 0.8)',
      cash: 'rgba(75, 192, 192, 0.8)',
      other: 'rgba(153, 102, 255, 0.8)'
    };

    // For payment status distribution (Bar Chart)
    const statusAmounts = {
      completed: 0,
      pending: 0,
      failed: 0
    };

    payments.forEach(payment => {
      // Count payment methods
      const method = payment.payment_method || 'other';
      methodCounts[method] = (methodCounts[method] || 0) + 1;
      
      // Sum amounts by status
      const status = payment.status || 'pending';
      if (statusAmounts.hasOwnProperty(status)) {
        statusAmounts[status] += payment.amount || 0;
      }
    });

    // Prepare pie chart data
    const pieData = {
      labels: Object.keys(methodCounts).map(method => 
        method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
      ),
      datasets: [{
        data: Object.values(methodCounts),
        backgroundColor: Object.keys(methodCounts).map(method => methodColors[method] || methodColors.other),
        borderWidth: 1
      }]
    };

    // Prepare bar chart data
    const barData = {
      labels: Object.keys(statusAmounts).map(status => 
        status.charAt(0).toUpperCase() + status.slice(1)
      ),
      datasets: [{
        label: 'Amount ($)',
        data: Object.values(statusAmounts),
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(255, 99, 132, 0.8)'
        ],
        borderWidth: 1
      }]
    };

    return { pieData, barData };
  };

  const { pieData, barData } = processChartData();

  // Chart options
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Payment Methods Distribution',
        font: {
          size: 16
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Payment Amounts by Status',
        font: {
          size: 16
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <Pie data={pieData} options={pieOptions} />
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <Bar data={barData} options={barOptions} />
      </div>
    </div>
  );
}

export default PaymentCharts;