<template>
  <div class="relative-position">
    <div ref="chartContainer" class="chart" />
    <q-spinner
      v-if="loading"
      class="absolute-center"
      color="primary"
      size="3em"
      :thickness="10"
    />
  </div>
</template>

<script lang="ts">
import defer from 'lodash/defer'
import { getCountryPairs } from 'src/utils/country-list';
import { defineComponent, onMounted, onUnmounted, ref, toRef } from 'vue'

import type { MapChart } from '@amcharts/amcharts4/maps'
import type { PropType } from 'vue'

export default defineComponent({
  components: {},
  props: {
    restrictions: {
      type: Object ,
      required: true,
    },
  },
  setup(props) {
    const restrictions = toRef(props, 'restrictions')
    const chartContainer = ref()
    const loading = ref<boolean | undefined>()
    let chart: MapChart
    const initializeChart = async () => {
      loading.value = true
      const { createChart } = await import(
        /* webpackChunkName: "map" */ './map'
      )
      if (chart) {
        chart.dispose()
      }

      defer(() => {
        chart = createChart(
          chartContainer.value,
          [],
        )
        chart.events.once('ready', () => {
          loading.value = false
        })
      })
    }

    onMounted(initializeChart)

    onUnmounted(() => {
      if (!chart) {
        return
      }
      chart.dispose()
    })

    return { chartContainer, loading }
  },
})
</script>

<style lang="scss" scoped>
.chart {
  z-index: 20;
  width: 100%;
  height: 670px;
}
</style>
