(() => {
    'use strict';

    class xMath {
        /**
         * Сумма
         * @param  {number} ... Значения
         * @return {number}     Сумма
         */
        static sum(/* ... */) {
            let arr = arguments;
            let a = arr[0];
            for (let i = 1; i < arr.length; i++) a += arr[i];
            return a;
        }

        /**
         * Получить диапазон [first, last)
         * @param  {number}   first
         * @param  {number}   last
         * @return {number[]}
         */
        static range(first, last) {
            let size = last - first;
            let arr = new Array(size);
            for (let i = 0; i < size; i++) arr[i] = i + first;
            return arr;
        }
    }

    window.xMath = xMath;
})();
