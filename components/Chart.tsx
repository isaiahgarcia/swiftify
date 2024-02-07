"use client";

import dynamic from "next/dynamic";
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface PieChartProps {
    seriesData: any[];
    labelNames: any[];
};

export const PieChart: React.FC<PieChartProps> = ({
    seriesData,
    labelNames
}) => {

    const option = {
        chart: {
          width: 380,
        },
        colors: ["#b9d2b5", "#f4cb8d", "#d1b2d2", "#823549", "#b5e9f6", "#847e80", "#f9b2d0", "#cfcac6", "#c8ae95", "#434961"],
        labels: labelNames,
        plotOptions: {
          pie: {
            startAngle: -90,
            endAngle: 270,
            donut: {
                size: '50%',
            }
          },
        },
        fill: {
            type: "gradient",
        },
        legend: {
            formatter: function(val: any, opts: any) {
                return val + " - " + opts.w.globals.series[opts.seriesIndex]
            }
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    width: 200
                },
                legend: {
                    position: 'bottom'
                }
            }
        }]
      }

    const series = seriesData;

    return(
        <>
            <ApexChart type="donut" options={option} series={series} height={200} width={500} />
        </>
    )
    
}