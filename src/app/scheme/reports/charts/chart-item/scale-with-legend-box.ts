import {ChartArea, LinearScale, Scale} from 'chart.js';

export class ScaleWithLegendBox extends LinearScale implements Scale {
    public static id = 'LinearWithLegend';

    draw(chartArea: ChartArea) {
        super.draw(chartArea);
        // @ts-ignore
        if (!this._isVisible()) {
            return;
        }

        this.drawLegend();
    }

    drawLegend() {
        const legend = this.getLegend();

        const dataset_count = legend.length;
        const s = Math.sqrt(dataset_count);
        const column_count = Math.ceil(s);
        const row_count = Math.floor(s);

        const width = 30;
        const height = 30;
        const ctx = this.chart.canvas.getContext('2d');

        const field_width = width / column_count;
        const field_height = height / row_count;

        const padding = (this.right - this.left - width) / 2;
        const boxX = this.left + padding;
        const boxY = this.bottom + 10;

        for (let i = 0; i < legend.length; ++i) {
            ctx.fillStyle = legend[i];
            const row = Math.round(i / column_count);
            const column = i % column_count;
            const x = column * field_width + boxX;
            const y = row * field_height + boxY;

            ctx.fillRect(x, y, field_width, field_height);
        }
    }

    private getLegend() {
        return this.chart.config.data.datasets
            // @ts-ignore
            .filter((ds) => ds.yAxisID === this.id)
            .map((ds) => ds.borderColor as string);
    }
}
