import { Tab } from "./tab";

import Chart from "chart.js";
import $ from "jquery";
import { StatsRepository } from "../repository/stats-repository";

export class StatsTab implements Tab {

    private titles: { [key: string]: string } = {
        "0-0": "Unknown",
        "1-5": "Beginner_05",
        "1-4": "Beginner_04",
        "1-3": "Beginner_03",
        "1-2": "Beginner_02",
        "1-1": "Beginner_01",
        "2-5": "Novice_05",
        "2-4": "Novice_04",
        "2-3": "Novice_03",
        "2-2": "Novice_02",
        "2-1": "Novice_01",
        "3-5": "Experienced_05",
        "3-4": "Experienced_04",
        "3-3": "Experienced_03",
        "3-2": "Experienced_02",
        "3-1": "Experienced_01",
        "4-5": "Skilled_05",
        "4-4": "Skilled_04",
        "4-3": "Skilled_03",
        "4-2": "Skilled_02",
        "4-1": "Skilled_01",
        "5-5": "Specialist_05",
        "5-4": "Specialist_04",
        "5-3": "Specialist_03",
        "5-2": "Specialist_02",
        "5-1": "Specialist_01",
        "6-0": "Expert",
        "7-0": "Survivor"
    };

    public start() {
        this.buildImageList(
            StatsRepository.instance.stats.currentAttributes,
            '#current-rank-img',
            '#current-rank-score',
            '#current-rank-title'
        );

        this.statRollup();
    }

    public stop() {

    }

    public pause() {

    }

    public resume() {

    }

    private buildImageList(attributes: any, placeholder: string, score: string, title: string) {
        let bestRank: number = 0;
        let bestRankTitle: string = '0-0';

        for (let i in attributes) {
            let season = attributes[i];
            if (season.rankPoints > bestRank) {
                bestRank = season.rankPoints;
                bestRankTitle = season.rankPointsTitle;
            }
        }

        $(placeholder).attr('src', '../img/ranks/' + this.titles[bestRankTitle] + '.png');
        $(score).html('' + Math.round(bestRank));
        $(title).html('' + this.titles[bestRankTitle].replace('_0', ' '));
    }

    private statRollup() {
        let totalKills = 0;
        let totalHeadshots = 0;
        let totalWins = 0;
        let totalGames = 0;
        
        let seasonKills = 0;
        let seasonHeadshots = 0;
        let seasonWins = 0;
        let seasonGames = 0;

        let weaponsAcquired = 0;
        let longestKill = 0;
        let longestTimeSurvived = 0;
        let maxKillStreaks = 0;

        for (let i in StatsRepository.instance.stats.currentAttributes) {
            let season = StatsRepository.instance.stats.currentAttributes[i];
            totalKills += season.kills;
            totalHeadshots += season.headshotKills;
            totalWins += season.wins;
            totalGames += season.roundsPlayed;

            seasonKills += season.kills;
            seasonHeadshots += season.headshotKills;
            seasonWins += season.wins;
            seasonGames += season.roundsPlayed;

            weaponsAcquired += season.weaponsAcquired;

            if (longestKill < season.longestKill) {
                longestKill = season.longestKill;
            }
            if (longestTimeSurvived < season.longestTimeSurvived) {
                longestTimeSurvived = season.longestTimeSurvived;
            }
            if (maxKillStreaks < season.maxKillStreaks) {
                maxKillStreaks = season.maxKillStreaks;
            }
        }

        for (let i in StatsRepository.instance.stats.attributes) {
            let season = StatsRepository.instance.stats.attributes[i];
            totalKills += season.kills;
            totalHeadshots += season.headshotKills;
            totalWins += season.wins;
            totalGames += season.roundsPlayed;
            
            weaponsAcquired += season.weaponsAcquired;
            
            if (longestKill < season.longestKill) {
                longestKill = season.longestKill;
            }
            if (longestTimeSurvived < season.longestTimeSurvived) {
                longestTimeSurvived = season.longestTimeSurvived;
            }
            if (maxKillStreaks < season.maxKillStreaks) {
                maxKillStreaks = season.maxKillStreaks;
            }
        }

        $('#current-kills').html('' + seasonKills);

        let headshotPercentage = Math.round(seasonHeadshots/seasonKills*100)/100;
        if (isNaN(headshotPercentage)) {
            headshotPercentage = 0;
        }
        $('#current-headshots').html('' + seasonHeadshots + ' (' + headshotPercentage + '%)');
        $('#current-wins').html('' + seasonWins);

        let gamesPercentage = Math.round(seasonWins/seasonGames*100)/100;
        if (isNaN(gamesPercentage)) {
            gamesPercentage = 0;
        }

        $('#current-games').html('' + seasonGames + ' (' + gamesPercentage + '%)');

        $('#lifetime-kills').html('' + totalKills);

        let lifetimeHeadshotPercentage = Math.round(totalHeadshots/totalKills*100)/100;
        if (isNaN(lifetimeHeadshotPercentage)) {
            lifetimeHeadshotPercentage = 0;
        }

        $('#lifetime-headshots').html('' + totalHeadshots + ' (' + lifetimeHeadshotPercentage + '%)');
        $('#lifetime-wins').html('' + totalWins);

        let lifetimeGame = Math.round(totalWins/totalGames*100)/100;
        if (isNaN(lifetimeGame)) {
            lifetimeGame = 0;
        }
        
        $('#lifetime-games').html('' + totalGames + ' (' + lifetimeGame + '%)');

        
        $('#feats-weapons').html('' + weaponsAcquired);
        $('#feats-longest').html('' + Math.round(longestKill) + 'm');
        let minutes = Math.round(longestTimeSurvived/60);
        let seconds = Math.round(longestTimeSurvived%60);
        $('#feats-survived').html('' + minutes + ':' + ((10 > seconds) ? '0' : '') + seconds);
        $('#feats-streak').html('' + maxKillStreaks);
    }

    public loadCharts() {

        let canvas = <HTMLCanvasElement>document.getElementById("mycanvas");
        let ctx = <CanvasRenderingContext2D>canvas.getContext("2d");

        let data = {
            labels: ['Head', 'Torso', 'Arm', 'Leg', 'N/A'],
            datasets: [{
                label: '% of shots',
                data: [50, 30, 10, 5, 5],
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                pointBackgroundColor: "rgba(179,181,198,1)",
                pointBorderColor: "#fff",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: "rgba(179,181,198,1)",
            }]
        };

        let options = {
            responsive: true,
            maintainAspectRatio: true,
            scale: {
                ticks: {
                    beginAtZero: true,
                    stepSize: 10,
                    max: 50
                }
            }
        };

        let myChart = new Chart(ctx, {
            type: 'radar',
            data: data,
            options: options
        });
    }
}