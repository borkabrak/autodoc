#!/usr/bin/env perl
#
# Analyze the KAML (Ken's Application Markup Language) source for
# reports, identifying unique elements and all their possible attributes. 

use strict;
use List::MoreUtils;
use Text::ParseWords;
use Data::Dumper;

# config
my $apifile ="/cygdrive/c/TFS/Data\ Intelligence\ Tool/src/ditool/DEV/api.js";
my $outdir = '/home/jcarter/ditool/didoc/reports';

my $elements = find_in_file( qr/(di_\w+)/i, $apifile);
print scalar @$elements . " elements found.\n";

foreach my $element (@$elements){

    my $filename = "$outdir/$element.mkd";
    if (! -e $filename) {
        print "Creating $filename\n";
        open MKD, ">", $filename;
        print MKD <<MARKDOWN;
# $element

------------------------------------------------------------------------------

MARKDOWN
        close MKD;
    };
}

#-- END ----------------------------------------------------------------------------

sub find_in_file {
    # Returns a (reference to a) sorted, unique array of all matches for $regex
    # on the contents of $file
    my ($regex, $file) = @_;
    open (INPUT, "<", $file) or die "Can't open '$file':$!";
    my $input = join ' ' , <INPUT>;
    close INPUT;
    my @output = sort keys %{{ map { lc($_) => 1 } $input =~ /$regex/g }};
    return \@output;
}
