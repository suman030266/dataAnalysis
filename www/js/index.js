$(()=>{
    let n = 1;
    let minPower = 200;
    let aaArr = [];
    let $mapBox = $('#map-box'),
        $btn = $('#btn'),
        $file = $('input[name="excel"]'),
        $call = $('.call');
    function fn(data){
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
    function drawCharts(obj){
        let {title, date, num} = obj;
        num.forEach((item, index)=>{
            if(item <= minPower){
                aaArr.push({
                    title,
                    num: item,
                    date: date[index]
                });
            }
        });
        n ++;
        let ele = document.createElement('div');
        ele.id = 'map' + n;
        ele.className = 'map';
        $mapBox[0].appendChild(ele);
        let myChart = echarts.init(ele);
        let option = {
            title: {
                text: title,
                subtext: ''
            },
            tooltip: {
                trigger: 'axis'
            },
            xAxis:  {
                type: 'category',
                boundaryGap: false,
                data: date
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: '{value} 卡'
                }
            },
            series: [
                {
                    // name:'最高气温',
                    type:'line',
                    data: num,
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
    function getData(){
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
                let arr = fn(data);
                arr.forEach(item=>{
                    drawCharts(item);
                });
                calls();
            },
            complete(){
                // console.log('complete');
            }
        });
    }
    function calls(){
        console.log(aaArr);
        if(aaArr.length){
            $call.show();
            let str = ``;
            aaArr.forEach(item =>{
                str += `<li><b>${item.title}</b> / <span>${item.date}</span> / 数量 <i>${item.num}</i></li>`;
            });
            $call.find('ul').append(str);
        }else{
            $call.hide();
        }
    }
    $file.on('change', (e)=>{
        if(e.target.value){
            getData();
        }
    });
    $btn.on('click', ()=>{
        $file.click();
    });
    $('span.tip-title').on('click', ()=>{
        console.log()
        if($call.hasClass('open')){
            $call.removeClass('open').animate({height: '40px'});
        }else{
            $call.addClass('open').animate({height: '300px'});
        }
    });
});
