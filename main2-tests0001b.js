const { exit } = require('process')
const sre = require('speech-rule-engine')
const { execFileSync } = require('node:child_process')
const fs = require('fs')

// https://onlinexmltools.com/minify-xml
const math = [
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><msqrt><mn>3</mn><mi>i</mi></msqrt><mo>&#x2212;</mo><mn>2</mn><mi>i</mi></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><msqrt><mn>3</mn><mi>i</mi><mo>&#x2212;</mo><mn>2</mn><mi>i</mi></msqrt></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mroot><mrow><mn>4</mn><mi>i</mi></mrow><mn>3</mn></mroot><mo>&#x2212;</mo><mn>2</mn><mi>i</mi></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mroot><mrow><mn>4</mn><mi>i</mi><mo>&#x2212;</mo><mn>2</mn><mi>i</mi></mrow><mn>3</mn></mroot></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mi>sin</mi><mo>&#x2061;</mo><mo stretchy="false">(</mo><mn>3</mn><mi>i</mi><mo stretchy="false">)</mo><mo>&#x2212;</mo><mn>2</mn><mi>i</mi></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mi>sin</mi><mo>&#x2061;</mo><mo stretchy="false">(</mo><mn>3</mn><mi>i</mi><mo>&#x2212;</mo><mn>2</mn><mi>i</mi><mo stretchy="false">)</mo></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><msub><mi>n</mi><mrow><mi>k</mi><mo>&#x2212;</mo><mn>1</mn><mo>&#x2212;</mo><mi>b</mi></mrow></msub></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><msub><mi>n</mi><mrow><mi>k</mi><mo>&#x2212;</mo><mn>1</mn></mrow></msub><mo>&#x2212;</mo><mi>b</mi></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><msup><mi>n</mi><mrow><mi>n</mi><mo>&#x2212;</mo><mn>1</mn></mrow></msup></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><msup><mi>n</mi><mrow><mi>n</mi></mrow></msup><mo>&#x2212;</mo><mn>1</mn></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><msubsup><mi>n</mi><mrow><mi>k</mi><mo>&#x2212;</mo><mn>1</mn></mrow><mrow><mi>n</mi><mo>&#x2212;</mo><mn>1</mn></mrow></msubsup></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><msubsup><mi>n</mi><mrow><mi>k</mi><mo>&#x2212;</mo><mn>1</mn></mrow><mrow><mi>n</mi></mrow></msubsup><mo>&#x2212;</mo><mn>1</mn></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mrow><mo fence="true">(</mo><mi>s</mi><mo>+</mo><mi>t</mi><mo fence="true">)</mo></mrow><mo>&#xF7;</mo><mn>2</mn></mrow></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mi>s</mi><mo>+</mo><mi>t</mi><mo>&#xF7;</mo><mn>2</mn></mrow></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><msup><mi>x</mi><mrow><mi>n</mi><mo>&#x2212;</mo><mn>1</mn></mrow></msup></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><msup><mi>x</mi><mrow><mi>n</mi></mrow></msup><mo>&#x2212;</mo><mn>1</mn></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mi>x</mi><mo>=</mo><mfrac><mrow><mo>&#x2212;</mo><mi>b</mi><mo>&#x00B1;</mo><msqrt><msup><mi>b</mi><mn>2</mn></msup><mo>&#x2212;</mo><mn>4</mn><mi>a</mi><mi>c</mi></msqrt></mrow><mrow><mn>2</mn><mi>a</mi></mrow></mfrac></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><msup><mfenced><mrow><mi>a</mi><mo>+</mo><mi>b</mi></mrow></mfenced><mn>2</mn></msup></mrow></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mi>x</mi><mo>=</mo><mfrac><mrow><mrow><mo>-</mo><mi>b</mi></mrow><mo>&#xB1;<!--PlusMinus--></mo><msqrt><mrow><msup><mi>b</mi><mn>2</mn></msup><mo>-</mo><mrow><mn>4</mn><mo>&#x2062;<!--InvisibleTimes--></mo><mi>a</mi><mo>&#x2062;<!--InvisibleTimes--></mo><mi>c</mi></mrow></mrow></msqrt></mrow><mrow><mn>2</mn><mo>&#x2062;<!--InvisibleTimes--></mo><mi>a</mi></mrow></mfrac></mrow></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mrow><msup><mi>x</mi><mn>2</mn></msup><mo>+</mo><mrow><mn>4</mn><mo>&#x2062;<!--InvisibleTimes--></mo><mi>x</mi></mrow><mo>+</mo><mn>4</mn></mrow><mo>=</mo><mn>0</mn></mrow></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mi>z</mi><mfenced><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow></mfenced></mrow></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mi>A</mi><mo>=</mo><mfenced open="[" close="]"><mtable><mtr><mtd><mi>x</mi></mtd><mtd><mi>y</mi></mtd></mtr><mtr><mtd><mi>z</mi></mtd><mtd><mi>w</mi></mtd></mtr></mtable></mfenced></mrow></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><apply><eq/><ci>A</ci><matrix><matrixrow><ci>x</ci><ci>y</ci></matrixrow><matrixrow><ci>z</ci><ci>w</ci></matrixrow></matrix></apply></mrow></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mi> x </mi><mo> + </mo><mrow><mi> a </mi><mo> / </mo><mi> b </mi></mrow></mrow></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><msqrt><mo> - </mo><mn> 1 </mn></msqrt></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><msqrt><mrow><mo> - </mo><mn> 1 </mn></mrow></msqrt></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mi> sin </mi><mo> &#x2061;<!--ApplyFunction--> </mo><mi> x </mi></mrow></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mn> 1 </mn><mo> + </mo><mi> ... </mi><mo> + </mo><mi> n </mi></mrow></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mn> 2 </mn><mo> + </mo><mrow><mn> 3 </mn><mo> &#x2062;<!--InvisibleTimes--> </mo><mi> &#x2148;<!--ImaginaryI--> </mi></mrow></mrow></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mo> ( </mo><mrow><mi> a </mi><mo> + </mo><mi> b </mi></mrow><mo> ) </mo></mrow></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mo> [ </mo><mrow><mn> 0 </mn><mo> , </mo><mn> 1 </mn></mrow><mo> ) </mo></mrow></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mi> f </mi><mo> &#x2061;<!--ApplyFunction--> </mo><mrow><mo> ( </mo><mrow><mi> x </mi><mo> , </mo><mi> y </mi></mrow><mo> ) </mo></mrow></mrow></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mi> x </mi><mo> &#x2062;<!--InvisibleTimes--> </mo><mi> y </mi></mrow></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mi> f </mi><mo> &#x2061;<!--ApplyFunction--> </mo><mrow><mo> ( </mo><mi> x </mi><mo> ) </mo></mrow></mrow></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mi> sin </mi><mo> &#x2061;<!--ApplyFunction--> </mo><mi> x </mi></mrow></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><msub><mi> m </mi><mrow><mn> 1 </mn><mo> &#x2063;<!--InvisibleComma--> </mo><mn> 2 </mn></mrow></msub></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mo> &#x2146;<!--DifferentialD--> </mo><mrow><mo> &#x2146;<!--DifferentialD--> </mo><mi> x </mi></mrow></mfrac></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><munder><mo> ( </mo><mo> _ </mo></munder><mfrac><mi> a </mi><mi> b </mi></mfrac><mover><mo> ) </mo><mo> &#x203E;<!--OverBar--> </mo></mover></mrow></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mo maxsize="1"> ( </mo><mfrac><mi> a </mi><mi> b </mi></mfrac><mo maxsize="1"> ) </mo></mrow></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mi> x </mi><munder><mo> &#x2192;<!--RightArrow--> </mo><mtext> maps to </mtext></munder><mi> y </mi></mrow></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mo> there exists </mo><mrow><mrow><mi> &#x3B4;<!--delta--> </mi><mo> &gt; </mo><mn> 0 </mn></mrow><mo> such that </mo><mrow><mrow><mi> f </mi><mo> &#x2061;<!--ApplyFunction--> </mo><mrow><mo> ( </mo><mi> x </mi><mo> ) </mo></mrow></mrow><mo> &lt; </mo><mn> 1 </mn></mrow></mrow></mrow></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><msup><mrow><mi> x </mi><malignmark edge="right"/></mrow><mn> 2 </mn></msup></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mi><mglyph fontfamily="my-braid-font" index="2" alt="23braid"/></mi><mo>+</mo><mi><mglyph fontfamily="my-braid-font" index="5" alt="132braid"/></mi><mo>=</mo><mi><mglyph fontfamily="my-braid-font" index="3" alt="13braid"/></mi></mrow></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mrow><mn> 2 </mn><mo> &#x2062;<!--InvisibleTimes--> </mo><mi> x </mi></mrow><mo> + </mo><mi> y </mi><mo> - </mo><mi> z </mi></mrow></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mo> ( </mo><mrow><mi> x </mi><mo> , </mo><mi> y </mi></mrow><mo> ) </mo></mrow></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mo> ( </mo><mfrac linethickness="0"><mi> a </mi><mi> b </mi></mfrac><mo> ) </mo></mrow></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac linethickness="2"><mfrac><mi> a </mi><mi> b </mi></mfrac><mfrac><mi> c </mi><mi> d </mi></mfrac></mfrac></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mn> 1 </mn><mrow><msup><mi> x </mi><mn> 3 </mn></msup><mo> + </mo><mfrac><mi> x </mi><mn> 3 </mn></mfrac></mrow></mfrac><mo> = </mo><mfrac bevelled="true"><mn> 1 </mn><mrow><msup><mi> x </mi><mn> 3 </mn></msup><mo> + </mo><mfrac><mi> x </mi><mn> 3 </mn></mfrac></mrow></mfrac></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mrow><mn> 1 </mn><mo> + </mo><msqrt><mn> 5 </mn></msqrt></mrow><mn> 2 </mn></mfrac></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mstyle maxsize="1"><mrow><mo> ( </mo><mfrac><mi> a </mi><mi> b </mi></mfrac><mo> ) </mo></mrow></mstyle></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mrow><mi> x </mi><mo> + </mo><mi> y </mi><mo> + </mo><mi> z </mi></mrow><mrow><mi> x </mi><mphantom><mo form="infix"> + </mo><mi> y </mi></mphantom><mo> + </mo><mi> z </mi></mrow></mfrac></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mrow><mi> x </mi><mo> + </mo><mi> y </mi><mo> + </mo><mi> z </mi></mrow><mrow><mi> x </mi><mphantom><mo> + </mo></mphantom><mphantom><mi> y </mi></mphantom><mo> + </mo><mi> z </mi></mrow></mfrac></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mtable columnspacing="0pt" rowspacing="0pt"><mtr><mtd></mtd><mtd columnalign="right"><mn>10</mn></mtd></mtr><mtr><mtd columnalign="right"><mn>131</mn></mtd><mtd columnalign="right"><menclose notation="longdiv"><mn>1413</mn></menclose></mtd></mtr><mtr><mtd></mtd><mtd columnalign="right"><mrow><munder><mn>131</mn><mo> _ </mo></munder><mphantom><mn>3</mn></mphantom></mrow></mtd></mtr><mtr><mtd></mtd><mtd columnalign="right"><mn>103</mn></mtd></mtr></mtable></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><msub><mi>a</mi><mrow><menclose notation="actuarial"><mi>n</mi></menclose><mo>&#x2062;<!--it--></mo><mi>i</mi></mrow></msub></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><msup><mrow><mo> ( </mo><mrow><mi> x </mi><mo> + </mo><mi> y </mi></mrow><mo> ) </mo></mrow><mn> 2 </mn></msup></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><msubsup><mo> &#x222B;<!--int--> </mo><mn> 0 </mn><mn> 1 </mn></msubsup><mrow><msup><mi> &#x2147;<!--ExponentialE--> </mi><mi> x </mi></msup><mo> &#x2062;<!--InvisibleTimes--> </mo><mrow><mo> &#x2146;<!--DifferentialD--> </mo><mi> x </mi></mrow></mrow></mrow></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><munder accentunder="true"><mrow><mi> x </mi><mo> + </mo><mi> y </mi><mo> + </mo><mi> z </mi></mrow><mo> &#x23DF;<!--UnderBrace--> </mo></munder><mtext>&nbsp;versus&nbsp;</mtext><munder accentunder="false"><mrow><mi> x </mi><mo> + </mo><mi> y </mi><mo> + </mo><mi> z </mi></mrow><mo> &#x23DF;<!--UnderBrace--> </mo></munder></mrow></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mover accent="true"><mi> x </mi><mo> ^ </mo></mover><mtext>&nbsp;versus&nbsp;</mtext><mover accent="false"><mi> x </mi><mo> ^ </mo></mover></mrow></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mover accent="true"><mrow><mi> x </mi><mo> + </mo><mi> y </mi><mo> + </mo><mi> z </mi></mrow><mo> &#x23DE;<!--OverBrace--> </mo></mover><mtext>&nbsp;versus&nbsp;</mtext><mover accent="false"><mrow><mi> x </mi><mo> + </mo><mi> y </mi><mo> + </mo><mi> z </mi></mrow><mo> &#x23DE;<!--OverBrace--> </mo></mover></mrow></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mmultiscripts><mi> F </mi><mn> 1 </mn><none/><mprescripts/><mn> 0 </mn><none/></mmultiscripts><mo> &#x2061;<!--ApplyFunction--> </mo><mrow><mo> ( </mo><mrow><mo> ; </mo><mi> a </mi><mo> ; </mo><mi> z </mi></mrow><mo> ) </mo></mrow></mrow></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mmultiscripts><mi> R </mi><mi> i </mi><none/><none/><mi> j </mi><mi> k </mi><none/><mi> l </mi><none/></mmultiscripts></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mo> ( </mo><mtable><mtr><mtd><mn>1</mn></mtd><mtd><mn>0</mn></mtd><mtd><mn>0</mn></mtd></mtr><mtr><mtd><mn>0</mn></mtd><mtd><mn>1</mn></mtd><mtd><mn>0</mn></mtd></mtr><mtr><mtd><mn>0</mn></mtd><mtd><mn>0</mn></mtd><mtd><mn>1</mn></mtd></mtr></mtable><mo> ) </mo></mrow></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mtable groupalign="{decimalpoint left left decimalpoint left left decimalpoint}"><mtr><mtd><mrow><mrow><mrow><maligngroup/><mn> 8.44 </mn><mo> &#x2062;<!--InvisibleTimes--> </mo><maligngroup/><mi> x </mi></mrow><maligngroup/><mo> + </mo><mrow><maligngroup/><mn> 55 </mn><mo> &#x2062;<!--InvisibleTimes--> </mo><maligngroup/><mi> y </mi></mrow></mrow><maligngroup/><mo> = </mo><maligngroup/><mn> 0 </mn></mrow></mtd></mtr><mtr><mtd><mrow><mrow><mrow><maligngroup/><mn> 3.1 </mn><mo> &#x2062;<!--InvisibleTimes--> </mo><maligngroup/><mi> x </mi></mrow><maligngroup/><mo> - </mo><mrow><maligngroup/><mn> 0.7 </mn><mo> &#x2062;<!--InvisibleTimes--> </mo><maligngroup/><mi> y </mi></mrow></mrow><maligngroup/><mo> = </mo><maligngroup/><mrow><mo> - </mo><mn> 1.1 </mn></mrow></mrow></mtd></mtr></mtable></math>',
    '<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><msubsup><mo>&#x222B;<!--int--></mo><mn>1</mn><mi>t</mi></msubsup><mfrac><mrow><mo>&#x2146;<!--dd--></mo><mi>x</mi></mrow><mi>x</mi></mfrac></mrow></math>',
    '<math><mrow><msubsup><mo> &#x222B;<!--int--> </mo><mn> 0 </mn><mn> 1 </mn></msubsup><mrow><msup><mi> &#x2147;<!--ExponentialE--> </mi><mi> x </mi></msup><mo> &#x2062;<!--InvisibleTimes--> </mo><mrow><mo> &#x2146;<!--DifferentialD--> </mo><mi> x </mi></mrow></mrow></mrow></math>'
]

const callMathCAT = (mathML) => {
    try {
        const stdout = execFileSync('mathcat.exe', [mathML], { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 })
        console.log(stdout.toString())
        return JSON.parse( stdout.toString().replaceAll('"','\\"').replaceAll("'",'"').replace('clearspeak','"clearspeak"').replace('braille','"braille"') )
    } catch(e) {
        console.log(e)
        return { "clearspeak": "ERROR", "braille": "ERROR" }
    }
}

function getSreResults(mathML) {
    return new Promise(resolve => {
        sre.setupEngine({
            locale: 'en',
            modality: 'speech',
            domain: 'mathspeak',
            style: 'default'
        }).then(()=>{
            const mathSpeak =sre.toSpeech(mathML)
            sre.setupEngine({
                locale: 'nemeth',
                modality: 'braille',
                domain: 'default',
                style: 'default'
            }).then(()=>{
                const sreBraille = sre.toSpeech(mathML)
                resolve({ "mathSpeak": mathSpeak, "sreBraille": sreBraille})
            })
        })

    })
}

async function getMathResults() {
    const results = []

    for(let i=0; i<math.length; i++) {
        const mathML = math[i]
        const sreResults = await getSreResults(mathML)
        const mathCatResults = callMathCAT(mathML)
        results.push({ "mathML": mathML, "mathSpeak": sreResults.mathSpeak, "sreBraille": sreResults.sreBraille, "clearSpeak": mathCatResults.clearspeak, "mathCatBraille":mathCatResults.braille})
    }

    fs.writeFile('./mathSpeechAndBraile.json', JSON.stringify(results), err => {
        if (err) {
            console.error(err)
        }
        console.log("Done!")
    })
}


sre.engineReady().then(() => {
    // We're ready to work!

    getMathResults()

})



