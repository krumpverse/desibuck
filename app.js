import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const categories = ['Travelling', 'Buckness', 'Storytelling', 'Character', 'Basics', 'Liveness', 'Musicality'];

const KrumperScoreCard = ({ krumper, judgeNumber, onScoreChange, scores }) => {
  const handleSliderChange = (category, value) => {
    onScoreChange(`judge${judgeNumber}`, krumper, category, value[0]);
  };

  return (
    <Card className="mb-4">
      <CardHeader>Judge {judgeNumber} - Krumper {krumper}</CardHeader>
      <CardContent>
        {categories.map((category) => (
          <div key={category} className="mb-4">
            <label className="block mb-2">{category}: {scores[category] || 0}</label>
            <Slider
              min={0}
              max={5}
              step={1}
              value={[scores[category] || 0]}
              onValueChange={(value) => handleSliderChange(category, value)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const KrumpJudgingApp = () => {
  const [rounds, setRounds] = useState(1);
  const [currentRound, setCurrentRound] = useState(1);
  const [scores, setScores] = useState({
    1: { A: { judge1: {}, judge2: {}, judge3: {} }, B: { judge1: {}, judge2: {}, judge3: {} } },
    2: { A: { judge1: {}, judge2: {}, judge3: {} }, B: { judge1: {}, judge2: {}, judge3: {} } },
    3: { A: { judge1: {}, judge2: {}, judge3: {} }, B: { judge1: {}, judge2: {}, judge3: {} } },
  });
  const [winner, setWinner] = useState(null);
  const [finalScores, setFinalScores] = useState({ A: 0, B: 0 });
  const [isJudgingComplete, setIsJudgingComplete] = useState(false);

  const handleScoreChange = (judge, krumper, category, value) => {
    setScores((prevScores) => ({
      ...prevScores,
      [currentRound]: {
        ...prevScores[currentRound],
        [krumper]: {
          ...prevScores[currentRound][krumper],
          [judge]: {
            ...prevScores[currentRound][krumper][judge],
            [category]: value,
          },
        },
      },
    }));
  };

  const calculateTotalScore = (roundScores) => {
    return Object.values(roundScores).reduce((total, judgeScores) => {
      return total + Object.values(judgeScores).reduce((sum, score) => sum + Object.values(score).reduce((catSum, catScore) => catSum + (catScore || 0), 0), 0);
    }, 0);
  };

  const determineWinner = () => {
    let totalScores = { A: 0, B: 0 };

    for (let round = 1; round <= rounds; round++) {
      totalScores.A += calculateTotalScore(scores[round].A);
      totalScores.B += calculateTotalScore(scores[round].B);
    }

    setFinalScores(totalScores);

    if (totalScores.A > totalScores.B) {
      setWinner('Krumper A');
    } else if (totalScores.B > totalScores.A) {
      setWinner('Krumper B');
    } else {
      setWinner('Tie');
    }

    setIsJudgingComplete(true);
  };

  const nextRound = () => {
    if (currentRound < rounds) {
      setCurrentRound(currentRound + 1);
    } else {
      determineWinner();
    }
  };

  const resetJudging = () => {
    setCurrentRound(1);
    setScores({
      1: { A: { judge1: {}, judge2: {}, judge3: {} }, B: { judge1: {}, judge2: {}, judge3: {} } },
      2: { A: { judge1: {}, judge2: {}, judge3: {} }, B: { judge1: {}, judge2: {}, judge3: {} } },
      3: { A: { judge1: {}, judge2: {}, judge3: {} }, B: { judge1: {}, judge2: {}, judge3: {} } },
    });
    setWinner(null);
    setFinalScores({ A: 0, B: 0 });
    setIsJudgingComplete(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Krump Judging App</h1>
      {!isJudgingComplete && (
        <>
          <div className="mb-4">
            <label className="block mb-2">Number of Rounds:</label>
            <Select onValueChange={(value) => setRounds(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Rounds" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <h2 className="text-xl font-semibold mb-4">Round {currentRound}</h2>
          <Tabs defaultValue="judge1">
            <TabsList>
              <TabsTrigger value="judge1">Judge 1</TabsTrigger>
              <TabsTrigger value="judge2">Judge 2</TabsTrigger>
              <TabsTrigger value="judge3">Judge 3</TabsTrigger>
            </TabsList>
            {['judge1', 'judge2', 'judge3'].map((judge, index) => (
              <TabsContent key={judge} value={judge}>
                <div className="flex space-x-4">
                  <KrumperScoreCard
                    krumper="A"
                    judgeNumber={index + 1}
                    onScoreChange={handleScoreChange}
                    scores={scores[currentRound].A[judge]}
                  />
                  <KrumperScoreCard
                    krumper="B"
                    judgeNumber={index + 1}
                    onScoreChange={handleScoreChange}
                    scores={scores[currentRound].B[judge]}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>
          <Button onClick={nextRound} className="mt-4">
            {currentRound < rounds ? 'Next Round' : 'Finish and Determine Winner'}
          </Button>
        </>
      )}
      {isJudgingComplete && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Final Results</h2>
          <p className="mb-2">Krumper A Total Score: {finalScores.A}</p>
          <p className="mb-2">Krumper B Total Score: {finalScores.B}</p>
          <h3 className="text-lg font-semibold mb-4">Winner: {winner}</h3>
          <Button onClick={resetJudging} className="mt-2">Start New Judging</Button>
        </div>
      )}
    </div>
  );
};

export default KrumpJudgingApp;
