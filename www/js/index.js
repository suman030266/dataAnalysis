$(()=>{
    let n = 1;
    let $mapBox = $('#map-box');
    $('#btn').on('click', ()=>{
        $.ajax({
            url: '/getExcel',
            type: 'POST',
            cache: false,
            data: new FormData($('#form')[0]),
            processData: false,
            contentType: false,
            dataType: 'json',
            success(res){
                let {data} = res;
                let arr = abc(data);
                arr.forEach(item=>{
                    drawCharts(item);
                });
            },
            complete(){
                console.log('complete');
            }
        });
    });
    function abc(data){
        console.log(data);
        let res = [];
        let obj = {};
        Object.keys(data).forEach(item =>{
            let arr = data[item];
            obj = {
                title: item,
                date: [],
                num: []
            };
            arr.forEach(a=>{
                obj.date.push(a.date);
                obj.num.push(a.num);
            })
            obj.title = item;
            res.push(obj);
        });
        return res;
    }
    // let date = ["2018-09-04", "2018-09-05", "2018-09-06", "2018-09-07", "2018-09-08"]
    // let num = [3970, 4171, 4357, 4301, 3437];
    function drawCharts(obj){
        n ++;
        let ele = document.createElement('div');
        ele.id = 'map' + n;
        ele.className = 'map';
        $mapBox[0].appendChild(ele);
        let myChart = echarts.init(ele);
        let option = {
            title: {
                text: obj.title,
                subtext: ''
            },
            tooltip: {
                trigger: 'axis'
            },
            xAxis:  {
                type: 'category',
                boundaryGap: false,
                data: obj.date
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: '{value} °C'
                }
            },
            series: [
                {
                    // name:'最高气温',
                    type:'line',
                    data: obj.num,
                    markPoint: {
                        data: [
                            {type: 'max', name: '最大值'},
                            {type: 'min', name: '最小值'}
                        ]
                    },
                    markLine: {
                        data: [
                            {type: 'average', name: '平均值'}
                        ]
                    }
                }
            ]
        };
        myChart.setOption(option);
    }
});






// function drawCharts(date, num){
//     let myChart = echarts.init(document.getElementById('map'));
//     let option = {
//         title: {
//             text: '[矿点]鄂尔多斯市东辰煤炭有限责任公司（3500大卡低硫煤）',
//             subtext: ''
//         },
//         tooltip: {
//             trigger: 'axis'
//         },
//         xAxis:  {
//             type: 'category',
//             boundaryGap: false,
//             data: date
//         },
//         yAxis: {
//             type: 'value',
//             axisLabel: {
//                 formatter: '{value} °C'
//             }
//         },
//         series: [
//             {
//                 // name:'最高气温',
//                 type:'line',
//                 data: num,
//                 markPoint: {
//                     data: [
//                         {type: 'max', name: '最大值'},
//                         {type: 'min', name: '最小值'}
//                     ]
//                 },
//                 markLine: {
//                     data: [
//                         {type: 'average', name: '平均值'}
//                     ]
//                 }
//             }
//         ]
//     };
//     myChart.setOption(option);
// }
// drawCharts(date, num);