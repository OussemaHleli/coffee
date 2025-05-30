import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { useAppSelector } from '../../store/hooks';
import { COLORS } from '../../theme';
import { 
  getTopItems, 
  getUsageByCategory, 
  getDailyUsage 
} from '../../utils/calculations';
import { formatDate } from '../../utils/formatters';

const screenWidth = Dimensions.get('window').width - 32;

export default function AnalyticsScreen() {
  const inventory = useAppSelector((state) => state.inventory.items);
  const categories = useAppSelector((state) => state.categories.categories);
  const usageLogs = useAppSelector((state) => state.usageLogs.entries);
  
  const [timeRange, setTimeRange] = useState<'7days' | '30days'>('7days');
  
  // Filter logs by time range
  const filteredLogs = usageLogs.filter((entry) => {
    const entryDate = new Date(entry.createdAt);
    const now = new Date();
    const diffDays = Math.ceil(
      (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return timeRange === '7days' ? diffDays <= 7 : diffDays <= 30;
  });
  
  // Calculate top items
  const topItems = getTopItems(filteredLogs, inventory);
  
  // Calculate bottom items (least used)
  const bottomItems = getTopItems(filteredLogs, inventory)
    .sort((a, b) => a.usage - b.usage)
    .slice(0, 5);
  
  // Calculate usage by category
  const categoryUsage = getUsageByCategory(filteredLogs, inventory, categories);
  
  // Calculate daily usage
  const dailyUsage = getDailyUsage(
    filteredLogs,
    timeRange === '7days' ? 7 : 30
  );
  
  // Prepare data for charts
  const barChartData = {
    labels: dailyUsage.map((d) => formatDate(d.date).slice(0, 5)),
    datasets: [
      {
        data: dailyUsage.map((d) => d.usage),
      },
    ],
  };
  
  const pieChartData = categoryUsage.slice(0, 5).map((cat) => ({
    name: cat.name,
    usage: cat.usage,
    color: getRandomColor(cat.id),
    legendFontColor: COLORS.textPrimary,
    legendFontSize: 12,
  }));
  
  // Generate a color based on ID (deterministic)
  function getRandomColor(id: string) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      COLORS.coffee,
      COLORS.coffeeLight,
      COLORS.oliveGreen,
      COLORS.oliveGreenLight,
      COLORS.creamDark,
      '#A97C50',
      '#8E6B44',
      '#5D6614',
    ];
    
    return colors[Math.abs(hash) % colors.length];
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
      </View>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            timeRange === '7days' && styles.filterButtonActive,
          ]}
          onPress={() => setTimeRange('7days')}
        >
          <Text
            style={[
              styles.filterText,
              timeRange === '7days' && styles.filterTextActive,
            ]}
          >
            Last 7 Days
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            timeRange === '30days' && styles.filterButtonActive,
          ]}
          onPress={() => setTimeRange('30days')}
        >
          <Text
            style={[
              styles.filterText,
              timeRange === '30days' && styles.filterTextActive,
            ]}
          >
            Last 30 Days
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {filteredLogs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No usage data available for the selected period
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Daily Usage</Text>
              <BarChart
                data={barChartData}
                width={screenWidth}
                height={220}
                yAxisSuffix=""
                chartConfig={{
                  backgroundColor: 'white',
                  backgroundGradientFrom: 'white',
                  backgroundGradientTo: 'white',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(111, 78, 55, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(33, 33, 33, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '6',
                    strokeWidth: '2',
                    stroke: '#ffa726',
                  },
                }}
                style={styles.chart}
              />
            </View>
            
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Usage by Category</Text>
              {pieChartData.length > 0 ? (
                <PieChart
                  data={pieChartData}
                  width={screenWidth}
                  height={220}
                  chartConfig={{
                    backgroundColor: 'white',
                    backgroundGradientFrom: 'white',
                    backgroundGradientTo: 'white',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(111, 78, 55, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(33, 33, 33, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                    propsForDots: {
                      r: '6',
                      strokeWidth: '2',
                      stroke: '#ffa726',
                    },
                  }}
                  accessor="usage"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  style={styles.chart}
                />
              ) : (
                <Text style={styles.noDataText}>No category data available</Text>
              )}
            </View>
            
            <View style={styles.tableContainer}>
              <Text style={styles.tableTitle}>Top 5 Used Items</Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, styles.tableItemColumn]}>
                    Item
                  </Text>
                  <Text style={[styles.tableHeaderText, styles.tableUsageColumn]}>
                    Usage
                  </Text>
                </View>
                
                {topItems.length > 0 ? (
                  topItems.map((item, index) => (
                    <View key={item.id} style={styles.tableRow}>
                      <Text style={[styles.tableText, styles.tableItemColumn]}>
                        {index + 1}. {item.name}
                      </Text>
                      <Text style={[styles.tableText, styles.tableUsageColumn]}>
                        {item.usage}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noDataText}>No data available</Text>
                )}
              </View>
            </View>
            
            <View style={styles.tableContainer}>
              <Text style={styles.tableTitle}>Least 5 Used Items</Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, styles.tableItemColumn]}>
                    Item
                  </Text>
                  <Text style={[styles.tableHeaderText, styles.tableUsageColumn]}>
                    Usage
                  </Text>
                </View>
                
                {bottomItems.length > 0 ? (
                  bottomItems.map((item, index) => (
                    <View key={item.id} style={styles.tableRow}>
                      <Text style={[styles.tableText, styles.tableItemColumn]}>
                        {index + 1}. {item.name}
                      </Text>
                      <Text style={[styles.tableText, styles.tableUsageColumn]}>
                        {item.usage}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noDataText}>No data available</Text>
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.coffee,
    padding: 16,
    paddingTop: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Roboto-Bold',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    justifyContent: 'space-around',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  filterButtonActive: {
    backgroundColor: COLORS.coffee,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: 'Roboto-Medium',
  },
  filterTextActive: {
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 16,
    paddingBottom: 100, // Extra padding for bottom tabs
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
    fontFamily: 'Roboto-Medium',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
    fontFamily: 'Roboto-Medium',
  },
  table: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.creamLight,
    padding: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Roboto-Medium',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  tableText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontFamily: 'Roboto-Regular',
  },
  tableItemColumn: {
    flex: 3,
  },
  tableUsageColumn: {
    flex: 1,
    textAlign: 'right',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontFamily: 'Roboto-Regular',
  },
  noDataText: {
    fontSize: 14,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
    fontFamily: 'Roboto-Regular',
  },
});